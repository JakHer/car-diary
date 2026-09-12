import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import type { OdometerReading } from '@/types'
import { OdometerChart } from './odometer-chart'

const createReading = (
  id: string,
  date: string,
  mileage: number,
  overrides: Partial<OdometerReading> = {},
): OdometerReading => ({
  id,
  vehicleId: 'vehicle-1',
  date,
  mileage,
  source: 'manual',
  sourceId: null,
  createdAt: `${date}T12:00:00.000Z`,
  ...overrides,
})

describe('OdometerChart', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('plots readings with tooltips and keeps the highest mileage from the same day', async () => {
    const user = userEvent.setup()
    render(
      <OdometerChart
        distanceUnit="km"
        fuelEntries={[
          {
            id: 'fuel-1',
            vehicleId: 'vehicle-1',
            date: '2026-09-12',
            mileage: 10_500,
            volumeInMilliliters: 40_000,
            totalCostInCents: 25_000,
            station: 'Orlen',
            fullTank: true,
            createdAt: '2026-09-12T12:00:00.000Z',
          },
        ]}
        locale="en-US"
        readings={[
          createReading('reading-1', '2026-09-01', 10_000),
          createReading('reading-2', '2026-09-01', 10_050),
          createReading('reading-3', '2026-09-12', 10_500, {
            source: 'fuel',
            sourceId: 'fuel-1',
          }),
        ]}
        records={[]}
        year={2026}
      />,
    )

    expect(
      screen.getByRole('img', { name: 'Odometer history for 2026' }),
    ).toBeVisible()
    expect(
      screen.getByLabelText('Manual update · Sep 1 · 10,050 km'),
    ).toBeVisible()
    expect(
      screen.queryByLabelText('Manual update · Sep 1 · 10,000 km'),
    ).not.toBeInTheDocument()
    const lastReading = screen.getByLabelText(
      'Fill-up · 40 l · Orlen · Sep 12 · 10,500 km',
    )
    expect(lastReading).toBeVisible()

    await user.hover(lastReading)

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Fill-up · 40 l · Orlen · Sep 12 · 10,500 km',
    )
  })

  it('shows an empty state until two dates are available', () => {
    render(
      <OdometerChart
        distanceUnit="km"
        fuelEntries={[]}
        locale="en-US"
        readings={[createReading('reading-1', '2026-09-01', 10_000)]}
        records={[]}
        year={2026}
      />,
    )

    expect(screen.getByText('Not enough mileage data')).toBeVisible()
  })

  it('ignores a derived baseline contradicted by an earlier historical entry', () => {
    render(
      <OdometerChart
        distanceUnit="km"
        fuelEntries={[]}
        locale="en-US"
        readings={[
          createReading('reading-1', '2026-08-18', 46_345, {
            source: 'fuel',
          }),
          createReading('reading-2', '2026-08-21', 46_000, {
            source: 'vehicle',
            sourceId: 'vehicle-1',
          }),
          createReading('reading-3', '2026-08-28', 46_735, {
            source: 'fuel',
          }),
        ]}
        records={[]}
        year={2026}
      />,
    )

    expect(
      screen.queryByLabelText(/Initial reading.*46,000 km/),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Fill-up.*46,345 km/)).toBeVisible()
    expect(screen.getByLabelText(/Fill-up.*46,735 km/)).toBeVisible()
  })
})

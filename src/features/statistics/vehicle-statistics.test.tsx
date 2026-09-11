import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import type { FuelEntry, ServiceRecord } from '@/types'
import { VehicleStatistics } from './vehicle-statistics'

const record: ServiceRecord = {
  id: 'service-1',
  vehicleId: 'vehicle-1',
  title: 'Oil service',
  category: 'Maintenance',
  date: '2026-01-10',
  mileage: 10_000,
  workshop: '',
  costInCents: 60_000,
  notes: '',
  createdAt: '2026-01-10T10:00:00.000Z',
}

const fuelEntry: FuelEntry = {
  id: 'fuel-1',
  vehicleId: 'vehicle-1',
  date: '2026-03-20',
  mileage: 12_000,
  volumeInMilliliters: 42_000,
  totalCostInCents: 45_000,
  station: '',
  fullTank: true,
  createdAt: '2026-03-20T10:00:00.000Z',
}

describe('VehicleStatistics', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-31T12:00:00.000Z'))
    await i18n.changeLanguage('en')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the yearly summary and accessible monthly breakdown', () => {
    render(
      <VehicleStatistics
        distanceUnit="km"
        fuelEntries={[fuelEntry]}
        locale="en-US"
        records={[record]}
      />,
    )

    expect(
      screen.getByRole('region', {
        name: 'Vehicle cost summary for 2026',
      }),
    ).toBeVisible()
    expect(screen.getByText('Monthly expenses')).toBeVisible()
    expect(screen.getByRole('combobox', { name: 'Statistics year' })).toHaveTextContent(
      '2026',
    )
    expect(screen.getByLabelText(/Jan.*total.*service.*fuel/i)).toBeVisible()
    expect(screen.getByLabelText(/Mar.*total.*service.*fuel/i)).toBeVisible()
  })

  it('shows an empty chart when the selected year has no costs', () => {
    render(
      <VehicleStatistics
        distanceUnit="km"
        fuelEntries={[]}
        locale="en-US"
        records={[]}
      />,
    )

    expect(screen.getByText('No expenses for this year')).toBeVisible()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import type { FuelEntry } from '../types'
import { FuelLog } from './FuelLog'

const entry: FuelEntry = {
  id: 'fuel-1',
  vehicleId: 'vehicle-1',
  date: '2026-08-16',
  mileage: 86_500,
  volumeInMilliliters: 42_750,
  totalCostInCents: 27_500,
  station: 'Orlen',
  fullTank: true,
  createdAt: '2026-08-16T12:00:00.000Z',
}

describe('FuelLog', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('creates a fuel entry in integer storage units', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)

    render(
      <FuelLog
        currentMileage={86_200}
        distanceUnit="km"
        entries={[]}
        isSaving={false}
        onCreate={onCreate}
        onDelete={vi.fn()}
      />,
    )

    await user.clear(screen.getByRole('spinbutton', { name: 'Fuel (liters)' }))
    await user.type(
      screen.getByRole('spinbutton', { name: 'Fuel (liters)' }),
      '42.75',
    )
    await user.type(
      screen.getByRole('spinbutton', { name: 'Total cost (PLN)' }),
      '275',
    )
    await user.type(screen.getByRole('textbox', { name: 'Station' }), 'Orlen')
    await user.click(screen.getByRole('checkbox', { name: 'Filled to full' }))
    await user.click(screen.getByRole('button', { name: 'Add fill-up' }))

    await waitFor(() => expect(onCreate).toHaveBeenCalledOnce())
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mileage: 86_200,
        volumeInMilliliters: 42_750,
        totalCostInCents: 27_500,
        station: 'Orlen',
        fullTank: true,
      }),
    )
    expect(
      screen.getByRole('spinbutton', { name: 'Fuel (liters)' }),
    ).toHaveValue(null)
    expect(
      screen.getByRole('spinbutton', { name: 'Total cost (PLN)' }),
    ).toHaveValue(null)
    expect(screen.getByRole('textbox', { name: 'Station' })).toHaveValue('')
    expect(
      screen.getByRole('checkbox', { name: 'Filled to full' }),
    ).not.toBeChecked()
  })

  it('shows a saved fill-up and allows deleting it', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <FuelLog
        currentMileage={86_500}
        distanceUnit="km"
        entries={[entry]}
        isSaving={false}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onDelete={onDelete}
      />,
    )

    expect(screen.getByText('42.75 l')).toBeVisible()
    expect(screen.getByText('Orlen')).toBeVisible()
    expect(screen.getByText('Full tank')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('fuel-1')
  })

  it('shows average consumption from complete full-tank cycles', () => {
    const currentYear = new Date().getFullYear()

    render(
      <FuelLog
        currentMileage={86_500}
        distanceUnit="km"
        entries={[
          {
            ...entry,
            id: 'fuel-1',
            date: `${currentYear}-08-15`,
            mileage: 86_000,
          },
          {
            ...entry,
            id: 'fuel-2',
            date: `${currentYear}-08-16`,
            mileage: 86_500,
            volumeInMilliliters: 50_000,
          },
        ]}
        isSaving={false}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('10.0 l/100 km')).toBeVisible()
    expect(screen.getByText(/PLN\s?55\.00\/100 km/)).toBeVisible()
    expect(screen.getByText('500 km')).toBeVisible()
  })
})

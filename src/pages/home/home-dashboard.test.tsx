import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import type { FuelEntry, MaintenanceReminder, ServiceRecord, Vehicle } from '@/types'
import { HomeDashboard } from './home-dashboard'

const vehicle: Vehicle = {
  id: 'vehicle-1',
  make: 'Audi',
  model: 'RS3',
  year: 2022,
  registrationNumber: 'WU0721P',
  vin: '',
  distanceUnit: 'km',
  startingMileage: 45_000,
  currentMileage: 46_000,
  createdAt: '2026-08-01T10:00:00.000Z',
}

const record: ServiceRecord = {
  id: 'record-1',
  vehicleId: vehicle.id,
  title: 'Engine oil change',
  category: 'Maintenance',
  date: '2026-08-18',
  mileage: 45_900,
  workshop: '',
  costInCents: 50_000,
  notes: '',
  createdAt: '2026-08-18T10:00:00.000Z',
}

const fuelEntry: FuelEntry = {
  id: 'fuel-1',
  vehicleId: vehicle.id,
  date: '2026-08-20',
  mileage: 46_000,
  volumeInMilliliters: 40_000,
  totalCostInCents: 26_000,
  station: 'Orlen',
  fullTank: true,
  createdAt: '2026-08-20T10:00:00.000Z',
}

const reminder: MaintenanceReminder = {
  id: 'reminder-1',
  vehicleId: vehicle.id,
  title: 'Replace brake fluid',
  dueDate: '2026-09-20',
  dueMileage: 50_000,
  completedAt: null,
  createdAt: '2026-08-20T10:00:00.000Z',
}

const renderDashboard = () =>
  render(
    <HomeDashboard
      fuelEntries={[fuelEntry]}
      isCreatingFuelEntry={false}
      isCreatingReminder={false}
      isSavingRecord={false}
      isUpdatingMileage={false}
      records={[record]}
      reminders={[reminder]}
      userName="Kuba"
      vehicle={vehicle}
      onCreateFuelEntry={vi.fn().mockResolvedValue(undefined)}
      onCreateReminder={vi.fn().mockResolvedValue(undefined)}
      onCreateServiceRecord={vi.fn().mockResolvedValue(undefined)}
      onOpenVehicle={vi.fn()}
      onUpdateMileage={vi.fn().mockResolvedValue(undefined)}
    />,
  )

describe('HomeDashboard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('greets the user and shows actionable vehicle context', () => {
    renderDashboard()

    expect(
      screen.getByRole('heading', {
        name: /Hi, Kuba! What are we doing today\?/,
      }),
    ).toBeVisible()
    expect(screen.getByText('Audi RS3')).toBeVisible()
    expect(screen.getByText('Replace brake fluid')).toBeVisible()
    expect(screen.getByText('Fill-up · 40 l')).toBeVisible()
    expect(screen.getByText('Engine oil change')).toBeVisible()
  })

  it('opens a working fuel form from the quick action', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await user.click(screen.getByRole('button', { name: /Add fill-up/ }))

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(
      screen.getByRole('spinbutton', { name: 'Fuel (liters)' }),
    ).toBeVisible()
  })
})

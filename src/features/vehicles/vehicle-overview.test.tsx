import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import type { Vehicle } from '@/types'
import { VehicleOverview } from './vehicle-overview'

const vehicle: Vehicle = {
  id: 'vehicle-1',
  make: 'Volvo',
  model: 'V60',
  year: 2021,
  registrationNumber: 'WX 1234A',
  vin: '',
  insurerName: 'PZU',
  policyNumber: 'POL-123',
  assistancePhone: '+48 22 123 45 67',
  startingMileage: 80_000,
  currentMileage: 86_200,
  distanceUnit: 'km',
  createdAt: '2026-08-01T10:00:00.000Z',
}

const renderOverview = (
  overviewVehicle = vehicle,
  onEditVehicle = vi.fn(),
) => {
  render(
    <MemoryRouter>
      <VehicleOverview
        fuelEntries={[]}
        locale="en-US"
        records={[]}
        reminders={[]}
        vehicle={overviewVehicle}
        onEditVehicle={onEditVehicle}
      />
    </MemoryRouter>,
  )

  return { onEditVehicle }
}

describe('VehicleOverview', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('shows policy details and a direct assistance call link', () => {
    renderOverview()

    expect(screen.getByText('PZU')).toBeVisible()
    expect(screen.getByText('Policy POL-123')).toBeVisible()
    expect(
      screen.getByRole('link', { name: /Call assistance/ }),
    ).toHaveAttribute('href', 'tel:+48221234567')
  })

  it('opens vehicle editing when no phone number is saved', async () => {
    const user = userEvent.setup()
    const onEditVehicle = vi.fn()
    renderOverview({ ...vehicle, assistancePhone: '' }, onEditVehicle)

    await user.click(
      screen.getByRole('button', { name: 'Add assistance contact' }),
    )

    expect(onEditVehicle).toHaveBeenCalledOnce()
  })
})

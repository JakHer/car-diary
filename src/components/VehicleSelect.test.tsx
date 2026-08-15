import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Vehicle } from '../types'
import { VehicleSelect } from './VehicleSelect'

const vehicles: Vehicle[] = [
  {
    id: 'vehicle-audi',
    make: 'Audi',
    model: 'RS3',
    year: 2022,
    registrationNumber: 'WA 12345',
    vin: '',
    startingMileage: 20_000,
    currentMileage: 32_000,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'vehicle-volvo',
    make: 'Volvo',
    model: 'V60',
    year: 2021,
    registrationNumber: 'KR 45678',
    vin: '',
    startingMileage: 80_000,
    currentMileage: 126_000,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

describe('VehicleSelect', () => {
  it('reports the selected vehicle id', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <VehicleSelect
        activeVehicleId={vehicles[0].id}
        vehicles={vehicles}
        onSelect={onSelect}
      />,
    )

    await user.click(
      screen.getByRole('combobox', { name: 'Active vehicle' }),
    )
    await user.click(screen.getByRole('option', { name: 'Volvo V60' }))

    expect(onSelect).toHaveBeenCalledWith('vehicle-volvo')
  })
})

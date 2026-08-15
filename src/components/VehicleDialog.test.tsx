import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Vehicle } from '../types'
import { VehicleDialog } from './VehicleDialog'

const vehicle: Vehicle = {
  id: 'vehicle-1',
  make: 'Volvo',
  model: 'V60',
  year: 2021,
  registrationNumber: 'WX 1234A',
  vin: '',
  startingMileage: 80_000,
  currentMileage: 86_200,
  createdAt: '2026-08-01T10:00:00.000Z',
}

describe('VehicleDialog', () => {
  it('closes when Escape is pressed', () => {
    const onClose = vi.fn()

    render(
      <VehicleDialog
        isSaving={false}
        mode="edit"
        vehicle={vehicle}
        onClose={onClose}
        onSave={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: 'Edit vehicle' }),
    ).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledOnce()
  })
})

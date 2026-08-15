import { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const VehicleDialogHarness = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open vehicle editor
      </button>
      <VehicleDialog
        isSaving={false}
        mode="edit"
        open={isOpen}
        vehicle={vehicle}
        onClose={() => setIsOpen(false)}
        onSave={vi.fn()}
      />
    </>
  )
}

describe('VehicleDialog', () => {
  it('closes when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <VehicleDialog
        isSaving={false}
        mode="edit"
        open
        vehicle={vehicle}
        onClose={onClose}
        onSave={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: 'Edit vehicle' }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('keeps the dialog open while saving', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <VehicleDialog
        isSaving
        mode="edit"
        open
        vehicle={vehicle}
        onClose={onClose}
        onSave={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Close vehicle form' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()

    await user.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
  })

  it('returns focus after closing', async () => {
    const user = userEvent.setup()

    render(<VehicleDialogHarness />)

    const openButton = screen.getByRole('button', {
      name: 'Open vehicle editor',
    })
    await user.click(openButton)
    await user.keyboard('{Escape}')

    await waitFor(() => expect(openButton).toHaveFocus())
  })
})

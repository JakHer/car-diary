import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { VehicleForm } from './VehicleForm'

describe('VehicleForm distance unit', () => {
  it('uses the account default and updates the mileage label', async () => {
    const user = userEvent.setup()

    render(
      <VehicleForm
        defaultDistanceUnit="mi"
        isSaving={false}
        onSave={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('spinbutton', { name: 'Current mileage (mi)' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('combobox', { name: 'Odometer unit' }),
    )
    await user.click(screen.getByRole('option', { name: 'Kilometers (km)' }))

    expect(
      screen.getByRole('spinbutton', { name: 'Current mileage (km)' }),
    ).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MileageDialog } from './mileage-dialog'

describe('MileageDialog', () => {
  it('rejects a lower mileage', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <MileageDialog
        currentMileage={86_200}
        distanceUnit="km"
        isSaving={false}
        vehicleName="Volvo V60"
        onSave={onSave}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Update mileage' }))
    const mileageInput = screen.getByRole('spinbutton', {
      name: 'Current mileage (km)',
    })
    await user.clear(mileageInput)
    await user.type(mileageInput, '85000')
    await user.click(screen.getByRole('button', { name: 'Update mileage' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Mileage cannot be lower than 86,200 km.',
    )
    expect(onSave).not.toHaveBeenCalled()
  })

  it('saves a higher mileage and closes', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)

    render(
      <MileageDialog
        currentMileage={86_200}
        distanceUnit="km"
        isSaving={false}
        vehicleName="Volvo V60"
        onSave={onSave}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Update mileage' }))
    const mileageInput = screen.getByRole('spinbutton', {
      name: 'Current mileage (km)',
    })
    await user.clear(mileageInput)
    await user.type(mileageInput, '90000')
    await user.click(screen.getByRole('button', { name: 'Update mileage' }))

    expect(onSave).toHaveBeenCalledWith(90_000)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

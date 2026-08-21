import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MaintenanceReminders } from '@/features/reminders/maintenance-reminders'
import { FuelLog } from '@/features/fuel/fuel-log'
import { ServiceForm } from '@/features/service-records/service-form'
import { VehicleForm } from '@/features/vehicles/vehicle-form'

describe('form submission state', () => {
  it('disables vehicle submission while saving', () => {
    render(<VehicleForm isSaving onSave={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: 'Saving vehicle...' }),
    ).toBeDisabled()
  })

  it('disables service submission while saving', () => {
    render(
      <ServiceForm
        currentMileage={86_200}
        distanceUnit="km"
        isSaving
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Saving record...' }),
    ).toBeDisabled()
  })

  it('disables reminder submission while saving', async () => {
    const user = userEvent.setup()
    render(
      <MaintenanceReminders
        currentMileage={86_200}
        distanceUnit="km"
        isSaving
        reminders={[]}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        onToggleCompleted={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add reminder' }))
    expect(
      screen.getByRole('button', { name: 'Adding reminder...' }),
    ).toBeDisabled()
  })

  it('disables fuel submission while saving', async () => {
    const user = userEvent.setup()
    render(
      <FuelLog
        attachments={[]}
        currentMileage={86_200}
        deletingAttachmentId={null}
        distanceUnit="km"
        entries={[]}
        isSaving
        uploadingFuelEntryId={null}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
        onDeleteAttachment={vi.fn()}
        onUpdate={vi.fn()}
        onUploadAttachment={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add fill-up' }))
    expect(
      screen.getByRole('button', { name: 'Adding fill-up...' }),
    ).toBeDisabled()
  })
})

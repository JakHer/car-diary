import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MaintenanceReminders } from './MaintenanceReminders'
import { FuelLog } from './FuelLog'
import { ServiceForm } from './ServiceForm'
import { VehicleForm } from './VehicleForm'

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

  it('disables reminder submission while saving', () => {
    render(
      <MaintenanceReminders
        currentMileage={86_200}
        distanceUnit="km"
        isSaving
        reminders={[]}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
        onToggleCompleted={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Adding reminder...' }),
    ).toBeDisabled()
  })

  it('disables fuel submission while saving', () => {
    render(
      <FuelLog
        currentMileage={86_200}
        distanceUnit="km"
        entries={[]}
        isSaving
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Adding fill-up...' }),
    ).toBeDisabled()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { MaintenanceReminder } from '@/types'
import { getMaintenanceReminderStatus } from '@/lib/maintenance-reminders'
import { MaintenanceReminders } from './maintenance-reminders'

const reminder: MaintenanceReminder = {
  id: 'reminder-1',
  vehicleId: 'vehicle-1',
  title: 'Replace timing belt',
  dueDate: '2026-09-01',
  dueMileage: 100_000,
  completedAt: null,
  createdAt: '2026-08-15T10:00:00.000Z',
}

describe('getMaintenanceReminderStatus', () => {
  it('marks a reminder as due when either target has been reached', () => {
    expect(
      getMaintenanceReminderStatus(reminder, 90_000, '2026-09-01'),
    ).toBe('overdue')
    expect(
      getMaintenanceReminderStatus(reminder, 100_000, '2026-08-20'),
    ).toBe('overdue')
  })

  it('prioritizes completed status', () => {
    expect(
      getMaintenanceReminderStatus(
        { ...reminder, completedAt: '2026-08-15T12:00:00.000Z' },
        120_000,
        '2026-10-01',
      ),
    ).toBe('completed')
  })
})

describe('MaintenanceReminders', () => {
  it('requires at least one due target', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)

    render(
      <MaintenanceReminders
        currentMileage={86_200}
        distanceUnit="km"
        isSaving={false}
        reminders={[]}
        onCreate={onCreate}
        onDelete={vi.fn()}
        onUpdate={vi.fn()}
        onToggleCompleted={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add reminder' }))
    await user.type(screen.getByLabelText('Reminder'), 'Oil change')
    await user.click(screen.getByRole('button', { name: 'Add reminder' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Add a due date, due mileage, or both.',
    )
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('runs reminder actions from accessible icon buttons', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onToggleCompleted = vi.fn()

    render(
      <MaintenanceReminders
        currentMileage={86_200}
        distanceUnit="km"
        isSaving={false}
        reminders={[reminder]}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onDelete={onDelete}
        onUpdate={vi.fn()}
        onToggleCompleted={onToggleCompleted}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Complete' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onToggleCompleted).toHaveBeenCalledWith('reminder-1', true)
    expect(onDelete).toHaveBeenCalledWith('reminder-1')
  })

  it('edits an existing reminder with its current values', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    render(
      <MaintenanceReminders
        currentMileage={86_200}
        distanceUnit="km"
        isSaving={false}
        reminders={[reminder]}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
        onUpdate={onUpdate}
        onToggleCompleted={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(
      screen.getByRole('heading', { name: 'Edit reminder' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Reminder')).toHaveValue(
      'Replace timing belt',
    )
    expect(screen.getByLabelText('Due mileage (km)')).toHaveValue(100_000)

    await user.clear(screen.getByLabelText('Reminder'))
    await user.type(
      screen.getByLabelText('Reminder'),
      'Replace timing chain',
    )
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onUpdate).toHaveBeenCalledWith('reminder-1', {
      title: 'Replace timing chain',
      dueDate: '2026-09-01',
      dueMileage: 100_000,
    })
    expect(
      screen.queryByRole('heading', { name: 'Edit reminder' }),
    ).not.toBeInTheDocument()
  })
})

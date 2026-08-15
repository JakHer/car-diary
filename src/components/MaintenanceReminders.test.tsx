import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { MaintenanceReminder } from '../types'
import { getMaintenanceReminderStatus } from '../lib/maintenanceReminders'
import { MaintenanceReminders } from './MaintenanceReminders'

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
    const onCreate = vi.fn()

    render(
      <MaintenanceReminders
        currentMileage={86_200}
        reminders={[]}
        onCreate={onCreate}
        onDelete={vi.fn()}
        onToggleCompleted={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Reminder'), 'Oil change')
    await user.click(screen.getByRole('button', { name: 'Add reminder' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Add a due date, due mileage, or both.',
    )
    expect(onCreate).not.toHaveBeenCalled()
  })
})

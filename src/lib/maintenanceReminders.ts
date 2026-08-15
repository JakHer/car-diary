import type { MaintenanceReminder } from '../types'

export type MaintenanceReminderStatus = 'completed' | 'overdue' | 'upcoming'

const getLocalDate = (): string => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export const getMaintenanceReminderStatus = (
  reminder: MaintenanceReminder,
  currentMileage: number,
  today = getLocalDate(),
): MaintenanceReminderStatus => {
  if (reminder.completedAt) return 'completed'

  const isDateDue = Boolean(reminder.dueDate && reminder.dueDate <= today)
  const isMileageDue =
    reminder.dueMileage !== null && currentMileage >= reminder.dueMileage

  return isDateDue || isMileageDue ? 'overdue' : 'upcoming'
}

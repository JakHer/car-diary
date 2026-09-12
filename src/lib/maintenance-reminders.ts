import type { MaintenanceReminder } from '../types'
import { getLocalDate } from './local-date'

export type MaintenanceReminderStatus = 'completed' | 'overdue' | 'upcoming'

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

import { useMutation } from '@tanstack/react-query'
import {
  createMaintenanceReminder,
  deleteMaintenanceReminder,
  setMaintenanceReminderCompleted,
  updateMaintenanceReminder,
} from '@/features/reminders/reminder-repository'
import type { MaintenanceReminderInput } from '@/types'
import { carDiaryKeys } from './car-diary-keys'
import type { MutationSuccessHandler } from './types'

interface CreateMaintenanceReminderVariables {
  vehicleId: string
  input: MaintenanceReminderInput
}

interface UpdateMaintenanceReminderVariables {
  reminderId: string
  input: MaintenanceReminderInput
}

interface SetMaintenanceReminderCompletedVariables {
  reminderId: string
  completed: boolean
}

export const useReminderMutations = (
  onSuccess: MutationSuccessHandler,
) => {
  const createMaintenanceReminderMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'create-maintenance-reminder'],
    mutationFn: ({
      vehicleId,
      input,
    }: CreateMaintenanceReminderVariables) =>
      createMaintenanceReminder(vehicleId, input),
    onSuccess,
  })
  const updateMaintenanceReminderMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'update-maintenance-reminder'],
    mutationFn: ({
      reminderId,
      input,
    }: UpdateMaintenanceReminderVariables) =>
      updateMaintenanceReminder(reminderId, input),
    onSuccess,
  })
  const setMaintenanceReminderCompletedMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'set-maintenance-reminder-completed'],
    mutationFn: ({
      reminderId,
      completed,
    }: SetMaintenanceReminderCompletedVariables) =>
      setMaintenanceReminderCompleted(reminderId, completed),
    onSuccess,
  })
  const deleteMaintenanceReminderMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-maintenance-reminder'],
    mutationFn: (reminderId: string) =>
      deleteMaintenanceReminder(reminderId),
    onSuccess,
  })

  return {
    createMaintenanceReminderMutation,
    updateMaintenanceReminderMutation,
    setMaintenanceReminderCompletedMutation,
    deleteMaintenanceReminderMutation,
  }
}

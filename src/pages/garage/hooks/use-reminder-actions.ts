import { useTranslation } from 'react-i18next'
import type { useCarDiary } from '@/hooks/use-car-diary'
import type { RequestDeletion } from '@/hooks/use-delete-confirmation'
import { appToast } from '@/lib/app-toast'
import type {
  MaintenanceReminder,
  MaintenanceReminderInput,
  Vehicle,
} from '@/types'

type ReminderController = Pick<
  ReturnType<typeof useCarDiary>,
  | 'createMaintenanceReminderMutation'
  | 'deleteMaintenanceReminderMutation'
  | 'resetMutationErrors'
  | 'setMaintenanceReminderCompletedMutation'
  | 'updateMaintenanceReminderMutation'
>

interface UseReminderActionsOptions {
  activeReminders: MaintenanceReminder[]
  activeVehicle?: Vehicle
  controller: ReminderController
  requestDeletion: RequestDeletion
}

export const useReminderActions = ({
  activeReminders,
  activeVehicle,
  controller,
  requestDeletion,
}: UseReminderActionsOptions) => {
  const { t } = useTranslation()

  const createReminder = async (input: MaintenanceReminderInput) => {
    if (!activeVehicle) return

    controller.resetMutationErrors()
    await controller.createMaintenanceReminderMutation.mutateAsync({
      vehicleId: activeVehicle.id,
      input,
    })
    appToast.success(t('notifications.reminderCreated'))
  }

  const updateReminder = async (
    reminderId: string,
    input: MaintenanceReminderInput,
  ) => {
    controller.resetMutationErrors()
    await controller.updateMaintenanceReminderMutation.mutateAsync({
      reminderId,
      input,
    })
    appToast.success(t('notifications.reminderUpdated'))
  }

  const toggleReminder = (reminderId: string, completed: boolean) => {
    controller.resetMutationErrors()
    void controller.setMaintenanceReminderCompletedMutation
      .mutateAsync({ reminderId, completed })
      .then(() =>
        appToast.success(
          t(
            completed
              ? 'notifications.reminderCompleted'
              : 'notifications.reminderReopened',
          ),
        ),
      )
      .catch(() => undefined)
  }

  const requestReminderDeletion = (reminderId: string) => {
    const reminder = activeReminders.find((entry) => entry.id === reminderId)
    if (!reminder) return

    requestDeletion({
      title: t('app.deleteReminderTitle', { title: reminder.title }),
      description: t('app.deleteReminderDescription'),
      onConfirm: async () => {
        controller.resetMutationErrors()
        await controller.deleteMaintenanceReminderMutation.mutateAsync(
          reminderId,
        )
        appToast.success(t('notifications.reminderDeleted'))
      },
    })
  }

  return {
    createReminder,
    requestReminderDeletion,
    toggleReminder,
    updateReminder,
  }
}

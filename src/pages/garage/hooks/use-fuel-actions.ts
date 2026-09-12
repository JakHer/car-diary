import { useTranslation } from 'react-i18next'
import { validateAttachment } from '@/features/attachments/attachment-storage'
import type { useCarDiary } from '@/hooks/use-car-diary'
import type { RequestDeletion } from '@/hooks/use-delete-confirmation'
import { appToast } from '@/lib/app-toast'
import type {
  FuelAttachment,
  FuelEntry,
  FuelEntryInput,
  Vehicle,
} from '@/types'
import type { AttachmentCleanup } from './use-attachment-cleanup'

type FuelController = Pick<
  ReturnType<typeof useCarDiary>,
  | 'createFuelEntryMutation'
  | 'deleteFuelAttachmentMutation'
  | 'deleteFuelEntryMutation'
  | 'resetMutationErrors'
  | 'updateFuelEntryMutation'
  | 'uploadFuelAttachmentMutation'
>

interface UseFuelActionsOptions {
  activeFuelAttachments: FuelAttachment[]
  activeFuelEntries: FuelEntry[]
  activeVehicle?: Vehicle
  cleanupAttachmentFiles: AttachmentCleanup
  controller: FuelController
  requestDeletion: RequestDeletion
}

export const useFuelActions = ({
  activeFuelAttachments,
  activeFuelEntries,
  activeVehicle,
  cleanupAttachmentFiles,
  controller,
  requestDeletion,
}: UseFuelActionsOptions) => {
  const { t } = useTranslation()

  const createFuel = async (input: FuelEntryInput) => {
    if (!activeVehicle) return

    controller.resetMutationErrors()
    await controller.createFuelEntryMutation.mutateAsync({
      vehicleId: activeVehicle.id,
      input,
    })
    appToast.success(t('notifications.fuelCreated'))
  }

  const updateFuel = async (fuelEntryId: string, input: FuelEntryInput) => {
    controller.resetMutationErrors()
    await controller.updateFuelEntryMutation.mutateAsync({
      fuelEntryId,
      input,
    })
    appToast.success(t('notifications.fuelUpdated'))
  }

  const uploadFuelEntryAttachment = (fuelEntryId: string, file: File) => {
    const validationError = validateAttachment(file)
    if (validationError) {
      appToast.error(t(`attachments.errors.${validationError}`))
      return
    }

    controller.resetMutationErrors()
    void controller.uploadFuelAttachmentMutation
      .mutateAsync({ fuelEntryId, file })
      .then(() => appToast.success(t('notifications.attachmentUploaded')))
      .catch(() => undefined)
  }

  const requestFuelAttachmentDeletion = (attachmentId: string) => {
    const attachment = activeFuelAttachments.find(
      (entry) => entry.id === attachmentId,
    )
    if (!attachment) return

    requestDeletion({
      title: t('app.deleteAttachmentTitle', { name: attachment.fileName }),
      description: t('app.deleteAttachmentDescription'),
      onConfirm: async () => {
        controller.resetMutationErrors()
        await controller.deleteFuelAttachmentMutation.mutateAsync({
          attachmentId,
          storagePath: attachment.storagePath,
        })
        appToast.success(t('notifications.attachmentDeleted'))
      },
    })
  }

  const requestFuelEntryDeletion = (fuelEntryId: string) => {
    if (!activeFuelEntries.some((entry) => entry.id === fuelEntryId)) return

    requestDeletion({
      title: t('app.deleteFuelEntryTitle'),
      description: t('app.deleteFuelEntryDescription'),
      onConfirm: async () => {
        controller.resetMutationErrors()
        await cleanupAttachmentFiles(
          activeFuelAttachments
            .filter((attachment) => attachment.fuelEntryId === fuelEntryId)
            .map((attachment) => attachment.storagePath),
        )
        await controller.deleteFuelEntryMutation.mutateAsync(fuelEntryId)
        appToast.success(t('notifications.fuelDeleted'))
      },
    })
  }

  return {
    createFuel,
    requestFuelAttachmentDeletion,
    requestFuelEntryDeletion,
    updateFuel,
    uploadFuelEntryAttachment,
  }
}

import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import {
  validateAttachment,
} from '@/features/attachments/attachment-storage'
import type { useCarDiary } from '@/hooks/use-car-diary'
import type { RequestDeletion } from '@/hooks/use-delete-confirmation'
import { appToast } from '@/lib/app-toast'
import type {
  ServiceAttachment,
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
} from '@/types'
import type { AttachmentCleanup } from './use-attachment-cleanup'

type ServiceController = Pick<
  ReturnType<typeof useCarDiary>,
  | 'createServiceRecordMutation'
  | 'deleteServiceAttachmentMutation'
  | 'deleteServiceRecordMutation'
  | 'resetMutationErrors'
  | 'updateServiceRecordMutation'
  | 'uploadServiceAttachmentMutation'
>

interface UseServiceActionsOptions {
  activeAttachments: ServiceAttachment[]
  activeRecords: ServiceRecord[]
  activeVehicle?: Vehicle
  cleanupAttachmentFiles: AttachmentCleanup
  controller: ServiceController
  editingRecordId: string | null
  requestDeletion: RequestDeletion
  setEditingRecordId: Dispatch<SetStateAction<string | null>>
}

export const useServiceActions = ({
  activeAttachments,
  activeRecords,
  activeVehicle,
  cleanupAttachmentFiles,
  controller,
  editingRecordId,
  requestDeletion,
  setEditingRecordId,
}: UseServiceActionsOptions) => {
  const { t } = useTranslation()

  const saveServiceRecord = async (input: ServiceRecordInput) => {
    if (!activeVehicle) return

    controller.resetMutationErrors()
    const isEditing = Boolean(editingRecordId)
    const mutation = editingRecordId
      ? controller.updateServiceRecordMutation.mutateAsync({
          recordId: editingRecordId,
          input,
        })
      : controller.createServiceRecordMutation.mutateAsync({
          vehicleId: activeVehicle.id,
          input,
        })

    await mutation
    setEditingRecordId(null)
    appToast.success(
      t(
        isEditing
          ? 'notifications.serviceUpdated'
          : 'notifications.serviceCreated',
      ),
    )
  }

  const requestServiceRecordDeletion = (recordId: string) => {
    const record = activeRecords.find((entry) => entry.id === recordId)
    if (!activeVehicle || !record) return

    requestDeletion({
      title: t('app.deleteRecordTitle', { title: record.title }),
      description: t('app.deleteRecordDescription'),
      onConfirm: async () => {
        controller.resetMutationErrors()
        await cleanupAttachmentFiles(
          activeAttachments
            .filter(
              (attachment) => attachment.serviceRecordId === recordId,
            )
            .map((attachment) => attachment.storagePath),
        )
        await controller.deleteServiceRecordMutation.mutateAsync(recordId)
        if (editingRecordId === recordId) setEditingRecordId(null)
        appToast.success(t('notifications.serviceDeleted'))
      },
    })
  }

  const uploadServiceRecordAttachment = (recordId: string, file: File) => {
    const validationError = validateAttachment(file)
    if (validationError) {
      appToast.error(t(`attachments.errors.${validationError}`))
      return
    }

    controller.resetMutationErrors()
    void controller.uploadServiceAttachmentMutation
      .mutateAsync({ recordId, file })
      .then(() => appToast.success(t('notifications.attachmentUploaded')))
      .catch(() => undefined)
  }

  const requestServiceAttachmentDeletion = (attachmentId: string) => {
    const attachment = activeAttachments.find(
      (entry) => entry.id === attachmentId,
    )
    if (!attachment) return

    requestDeletion({
      title: t('app.deleteAttachmentTitle', { name: attachment.fileName }),
      description: t('app.deleteAttachmentDescription'),
      onConfirm: async () => {
        controller.resetMutationErrors()
        await controller.deleteServiceAttachmentMutation.mutateAsync({
          attachmentId,
          storagePath: attachment.storagePath,
        })
        appToast.success(t('notifications.attachmentDeleted'))
      },
    })
  }

  return {
    requestServiceAttachmentDeletion,
    requestServiceRecordDeletion,
    saveServiceRecord,
    uploadServiceRecordAttachment,
  }
}

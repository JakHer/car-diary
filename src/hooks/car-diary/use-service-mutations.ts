import { useMutation } from '@tanstack/react-query'
import {
  createServiceRecord,
  deleteServiceRecord,
  updateServiceRecord,
} from '@/features/service-records/service-record-repository'
import {
  deleteServiceAttachment,
  uploadServiceAttachment,
} from '@/features/service-records/service-attachment-repository'
import type { ServiceRecordInput } from '@/types'
import { carDiaryKeys } from './car-diary-keys'
import type { MutationSuccessHandler } from './types'

interface CreateServiceRecordVariables {
  vehicleId: string
  input: ServiceRecordInput
}

interface UpdateServiceRecordVariables {
  recordId: string
  input: ServiceRecordInput
}

interface UploadServiceAttachmentVariables {
  recordId: string
  file: File
}

interface DeleteServiceAttachmentVariables {
  attachmentId: string
  storagePath: string
}

export const useServiceMutations = (
  userId: string,
  onSuccess: MutationSuccessHandler,
) => {
  const createServiceRecordMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'create-service-record'],
    mutationFn: ({ vehicleId, input }: CreateServiceRecordVariables) =>
      createServiceRecord(vehicleId, input),
    onSuccess,
  })
  const updateServiceRecordMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'update-service-record'],
    mutationFn: ({ recordId, input }: UpdateServiceRecordVariables) =>
      updateServiceRecord(recordId, input),
    onSuccess,
  })
  const deleteServiceRecordMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-service-record'],
    mutationFn: (recordId: string) => deleteServiceRecord(recordId),
    onSuccess,
  })
  const uploadServiceAttachmentMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'upload-service-attachment'],
    mutationFn: ({ recordId, file }: UploadServiceAttachmentVariables) =>
      uploadServiceAttachment(userId, recordId, file),
    onSuccess,
  })
  const deleteServiceAttachmentMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-service-attachment'],
    mutationFn: ({
      attachmentId,
      storagePath,
    }: DeleteServiceAttachmentVariables) =>
      deleteServiceAttachment(attachmentId, storagePath),
    onSuccess,
  })

  return {
    createServiceRecordMutation,
    updateServiceRecordMutation,
    deleteServiceRecordMutation,
    uploadServiceAttachmentMutation,
    deleteServiceAttachmentMutation,
  }
}

import { useMutation } from '@tanstack/react-query'
import {
  createFuelEntry,
  deleteFuelEntry,
  updateFuelEntry,
} from '@/features/fuel/fuel-repository'
import {
  deleteFuelAttachment,
  uploadFuelAttachment,
} from '@/features/fuel/fuel-attachment-repository'
import type { FuelEntryInput } from '@/types'
import { carDiaryKeys } from './car-diary-keys'
import type { MutationSuccessHandler } from './types'

interface CreateFuelEntryVariables {
  vehicleId: string
  input: FuelEntryInput
}

interface UpdateFuelEntryVariables {
  fuelEntryId: string
  input: FuelEntryInput
}

interface UploadFuelAttachmentVariables {
  fuelEntryId: string
  file: File
}

interface DeleteFuelAttachmentVariables {
  attachmentId: string
  storagePath: string
}

export const useFuelMutations = (
  userId: string,
  onSuccess: MutationSuccessHandler,
) => {
  const createFuelEntryMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'create-fuel-entry'],
    mutationFn: ({ vehicleId, input }: CreateFuelEntryVariables) =>
      createFuelEntry(vehicleId, input),
    onSuccess,
  })
  const updateFuelEntryMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'update-fuel-entry'],
    mutationFn: ({ fuelEntryId, input }: UpdateFuelEntryVariables) =>
      updateFuelEntry(fuelEntryId, input),
    onSuccess,
  })
  const deleteFuelEntryMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-fuel-entry'],
    mutationFn: (fuelEntryId: string) => deleteFuelEntry(fuelEntryId),
    onSuccess,
  })
  const uploadFuelAttachmentMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'upload-fuel-attachment'],
    mutationFn: ({ fuelEntryId, file }: UploadFuelAttachmentVariables) =>
      uploadFuelAttachment(userId, fuelEntryId, file),
    onSuccess,
  })
  const deleteFuelAttachmentMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-fuel-attachment'],
    mutationFn: ({ attachmentId, storagePath }: DeleteFuelAttachmentVariables) =>
      deleteFuelAttachment(attachmentId, storagePath),
    onSuccess,
  })

  return {
    createFuelEntryMutation,
    updateFuelEntryMutation,
    deleteFuelEntryMutation,
    uploadFuelAttachmentMutation,
    deleteFuelAttachmentMutation,
  }
}

import type { Dispatch, SetStateAction } from 'react'
import { useTranslation } from 'react-i18next'
import type { NavigateFunction } from 'react-router-dom'
import type { VehicleFormMode } from '@/features/vehicles/vehicle-dialog'
import type { useCarDiary } from '@/hooks/use-car-diary'
import type { RequestDeletion } from '@/hooks/use-delete-confirmation'
import { saveActiveVehicleId } from '@/lib/account-preferences'
import { appToast } from '@/lib/app-toast'
import { getVehiclePath } from '@/app/routing/vehicle-routes'
import type {
  FuelAttachment,
  FuelEntry,
  MaintenanceReminder,
  ServiceAttachment,
  ServiceRecord,
  Vehicle,
  VehicleInput,
} from '@/types'
import type { AttachmentCleanup } from './use-attachment-cleanup'

type VehicleController = Pick<
  ReturnType<typeof useCarDiary>,
  | 'createVehicleMutation'
  | 'deleteVehicleMutation'
  | 'resetMutationErrors'
  | 'updateVehicleMileageMutation'
  | 'updateVehicleMutation'
>

interface UseVehicleActionsOptions {
  activeAttachments: ServiceAttachment[]
  activeFuelAttachments: FuelAttachment[]
  activeFuelEntries: FuelEntry[]
  activeRecords: ServiceRecord[]
  activeReminders: MaintenanceReminder[]
  activeVehicle?: Vehicle
  cleanupAttachmentFiles: AttachmentCleanup
  controller: VehicleController
  navigate: NavigateFunction
  requestDeletion: RequestDeletion
  routeVehicleId?: string
  setEditingRecordId: Dispatch<SetStateAction<string | null>>
  setSelectedVehicleId: Dispatch<SetStateAction<string | null | undefined>>
  setVehicleFormMode: Dispatch<SetStateAction<VehicleFormMode | null>>
  vehicles: Vehicle[]
}

export const useVehicleActions = ({
  activeAttachments,
  activeFuelAttachments,
  activeFuelEntries,
  activeRecords,
  activeReminders,
  activeVehicle,
  cleanupAttachmentFiles,
  controller,
  navigate,
  requestDeletion,
  routeVehicleId,
  setEditingRecordId,
  setSelectedVehicleId,
  setVehicleFormMode,
  vehicles,
}: UseVehicleActionsOptions) => {
  const { t } = useTranslation()

  const addVehicle = (input: VehicleInput) => {
    controller.resetMutationErrors()
    void controller.createVehicleMutation
      .mutateAsync(input)
      .then((createdVehicleId) => {
        setSelectedVehicleId(createdVehicleId)
        void saveActiveVehicleId(createdVehicleId).catch(() =>
          appToast.error(t('header.activeVehicleSaveError')),
        )
        navigate(getVehiclePath(createdVehicleId))
        setEditingRecordId(null)
        setVehicleFormMode(null)
        appToast.success(t('notifications.vehicleCreated'))
      })
      .catch(() => undefined)
  }

  const updateVehicle = (input: VehicleInput) => {
    if (!activeVehicle) return

    controller.resetMutationErrors()
    void controller.updateVehicleMutation
      .mutateAsync({ vehicleId: activeVehicle.id, input })
      .then(() => {
        setVehicleFormMode(null)
        appToast.success(t('notifications.vehicleUpdated'))
      })
      .catch(() => undefined)
  }

  const updateMileage = async (currentMileage: number) => {
    if (!activeVehicle) return

    controller.resetMutationErrors()
    await controller.updateVehicleMileageMutation.mutateAsync({
      vehicleId: activeVehicle.id,
      currentMileage,
    })
    appToast.success(t('notifications.mileageUpdated'))
  }

  const selectVehicle = (nextVehicleId: string) => {
    setSelectedVehicleId(nextVehicleId)
    void saveActiveVehicleId(nextVehicleId).catch(() =>
      appToast.error(t('header.activeVehicleSaveError')),
    )
    if (routeVehicleId !== undefined) {
      navigate(getVehiclePath(nextVehicleId))
    }
    setEditingRecordId(null)
  }

  const requestVehicleDeletion = () => {
    if (!activeVehicle) return

    const vehicleToDelete = activeVehicle
    requestDeletion({
      title: t('app.deleteVehicleTitle', {
        vehicle: `${vehicleToDelete.make} ${vehicleToDelete.model}`,
      }),
      description: t('app.deleteVehicleDescription', {
        serviceCountText: t('app.serviceRecordCount', {
          count: activeRecords.length,
        }),
        fuelEntryCountText: t('app.fuelEntryCount', {
          count: activeFuelEntries.length,
        }),
        reminderCountText: t('app.reminderCount', {
          count: activeReminders.length,
        }),
      }),
      onConfirm: async () => {
        controller.resetMutationErrors()
        const fallbackVehicle = vehicles.find(
          (vehicle) => vehicle.id !== vehicleToDelete.id,
        )

        await cleanupAttachmentFiles(
          [...activeAttachments, ...activeFuelAttachments].map(
            (attachment) => attachment.storagePath,
          ),
        )
        await controller.deleteVehicleMutation.mutateAsync(vehicleToDelete.id)
        const nextActiveVehicleId = fallbackVehicle?.id ?? null
        setSelectedVehicleId(nextActiveVehicleId)
        void saveActiveVehicleId(nextActiveVehicleId).catch(() =>
          appToast.error(t('header.activeVehicleSaveError')),
        )
        navigate(fallbackVehicle ? getVehiclePath(fallbackVehicle.id) : '/', {
          replace: true,
        })
        setEditingRecordId(null)
        setVehicleFormMode(null)
        appToast.success(t('notifications.vehicleDeleted'))
      },
    })
  }

  return {
    addVehicle,
    requestVehicleDeletion,
    selectVehicle,
    updateMileage,
    updateVehicle,
  }
}

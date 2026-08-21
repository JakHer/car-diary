import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '@/components/layout/app-header'
import { PageHeader } from '@/components/layout/page-header'
import { ConfirmDialog } from '@/components/overlays/confirm-dialog'
import { ErrorScreen, LoadingScreen } from '@/components/feedback/status-screen'
import { Button } from '@/components/ui/button'
import {
  VehicleDialog,
  type VehicleFormMode,
} from '@/features/vehicles/vehicle-dialog'
import { VehicleDashboard } from '@/features/vehicles/vehicle-dashboard'
import { VehicleForm } from '@/features/vehicles/vehicle-form'
import { HomeDashboard } from '@/pages/home/home-dashboard'
import {
  removeAttachmentFiles,
  validateAttachment,
} from '@/features/attachments/attachment-storage'
import { useCarDiary } from '@/hooks/use-car-diary'
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation'
import { appToast } from '@/lib/app-toast'
import { saveActiveVehicleId } from '@/lib/account-preferences'
import {
  getVehiclePath,
  getVehicleRouteRedirect,
  isVehicleSection,
} from '@/app/routing/vehicle-routes'
import type {
  CarDiaryState,
  DistanceUnit,
  FuelEntryInput,
  MaintenanceReminderInput,
  ServiceRecordInput,
  VehicleInput,
} from '@/types'

const emptyState: CarDiaryState = {
  version: 5,
  vehicles: [],
  activeVehicleId: null,
  serviceRecords: [],
  serviceAttachments: [],
  fuelEntries: [],
  fuelAttachments: [],
  maintenanceReminders: [],
}

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

interface CarDiaryAppProps {
  defaultDistanceUnit: DistanceUnit
  initialActiveVehicleId?: string | null
  userId: string
  userEmail: string
  userName?: string
  onSignOut: () => Promise<void>
}

const CarDiaryApp = ({
  defaultDistanceUnit,
  initialActiveVehicleId,
  userId,
  userEmail,
  userName,
  onSignOut,
}: CarDiaryAppProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    section: routeSectionParam,
    vehicleId: routeVehicleId,
  } = useParams<{ section: string; vehicleId: string }>()
  const vehicleSection = routeSectionParam
    ? isVehicleSection(routeSectionParam)
      ? routeSectionParam
      : null
    : 'overview'
  const {
    stateQuery,
    createVehicleMutation,
    updateVehicleMutation,
    updateVehicleMileageMutation,
    deleteVehicleMutation,
    createServiceRecordMutation,
    updateServiceRecordMutation,
    deleteServiceRecordMutation,
    uploadServiceAttachmentMutation,
    deleteServiceAttachmentMutation,
    createFuelEntryMutation,
    updateFuelEntryMutation,
    deleteFuelEntryMutation,
    uploadFuelAttachmentMutation,
    deleteFuelAttachmentMutation,
    createMaintenanceReminderMutation,
    setMaintenanceReminderCompletedMutation,
    deleteMaintenanceReminderMutation,
    mutationError,
    isMutating,
    resetMutationErrors,
  } = useCarDiary(userId)
  const {
    closeDeleteConfirmation,
    confirmation: deleteConfirmation,
    confirmDeletion,
    isConfirming: isConfirmingDeletion,
    requestDeletion,
  } = useDeleteConfirmation()
  const state = stateQuery.data ?? emptyState
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    initialActiveVehicleId,
  )
  const [vehicleFormMode, setVehicleFormMode] =
    useState<VehicleFormMode | null>(null)

  useEffect(() => {
    setSelectedVehicleId(initialActiveVehicleId)
  }, [initialActiveVehicleId])

  const activeVehicle =
    state.vehicles.find((vehicle) => vehicle.id === routeVehicleId) ??
    (routeVehicleId === undefined
      ? state.vehicles.find(
          (vehicle) => vehicle.id === selectedVehicleId,
        ) ?? state.vehicles[0]
      : undefined)
  const activeVehicleId = activeVehicle?.id ?? null

  const activeRecords = useMemo(
    () =>
      state.serviceRecords
        .filter((record) => record.vehicleId === activeVehicleId)
        .toSorted(
          (first, second) =>
            second.date.localeCompare(first.date) ||
            second.mileage - first.mileage,
        ),
    [activeVehicleId, state.serviceRecords],
  )

  const activeReminders = useMemo(
    () =>
      state.maintenanceReminders.filter(
        (reminder) => reminder.vehicleId === activeVehicleId,
      ),
    [activeVehicleId, state.maintenanceReminders],
  )

  const activeFuelEntries = useMemo(
    () =>
      state.fuelEntries.filter(
        (entry) => entry.vehicleId === activeVehicleId,
      ),
    [activeVehicleId, state.fuelEntries],
  )

  const activeAttachments = useMemo(() => {
    const activeRecordIds = new Set(activeRecords.map((record) => record.id))
    return state.serviceAttachments.filter((attachment) =>
      activeRecordIds.has(attachment.serviceRecordId),
    )
  }, [activeRecords, state.serviceAttachments])

  const activeFuelAttachments = useMemo(() => {
    const activeFuelEntryIds = new Set(
      activeFuelEntries.map((entry) => entry.id),
    )
    return state.fuelAttachments.filter((attachment) =>
      activeFuelEntryIds.has(attachment.fuelEntryId),
    )
  }, [activeFuelEntries, state.fuelAttachments])

  const cleanupAttachmentFiles = async (storagePaths: string[]) => {
    try {
      await removeAttachmentFiles(storagePaths)
    } catch (error) {
      appToast.error(t('notifications.attachmentCleanupFailed'))
      throw error
    }
  }

  const addVehicle = (input: VehicleInput) => {
    resetMutationErrors()
    void createVehicleMutation
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

    resetMutationErrors()
    void updateVehicleMutation
      .mutateAsync({ vehicleId: activeVehicle.id, input })
      .then(() => {
        setVehicleFormMode(null)
        appToast.success(t('notifications.vehicleUpdated'))
      })
      .catch(() => undefined)
  }

  const updateMileage = async (currentMileage: number) => {
    if (!activeVehicle) return

    resetMutationErrors()
    await updateVehicleMileageMutation.mutateAsync({
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

    const serviceCount = activeRecords.length
    const reminderCount = activeReminders.length
    const fuelEntryCount = activeFuelEntries.length
    const vehicleToDelete = activeVehicle
    requestDeletion({
      title: t('app.deleteVehicleTitle', {
        vehicle: `${vehicleToDelete.make} ${vehicleToDelete.model}`,
      }),
      description: t('app.deleteVehicleDescription', {
        serviceCountText: t('app.serviceRecordCount', {
          count: serviceCount,
        }),
        fuelEntryCountText: t('app.fuelEntryCount', {
          count: fuelEntryCount,
        }),
        reminderCountText: t('app.reminderCount', { count: reminderCount }),
      }),
      onConfirm: async () => {
        resetMutationErrors()
        const fallbackVehicle = state.vehicles.find(
          (vehicle) => vehicle.id !== vehicleToDelete.id,
        )

        await cleanupAttachmentFiles(
          [...activeAttachments, ...activeFuelAttachments].map(
            (attachment) => attachment.storagePath,
          ),
        )
        await deleteVehicleMutation.mutateAsync(vehicleToDelete.id)
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

  const saveServiceRecord = async (input: ServiceRecordInput) => {
    if (!activeVehicle) return

    resetMutationErrors()
    const isEditing = Boolean(editingRecordId)
    const mutation = editingRecordId
      ? updateServiceRecordMutation.mutateAsync({
          recordId: editingRecordId,
          input,
        })
      : createServiceRecordMutation.mutateAsync({
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
        resetMutationErrors()
        await cleanupAttachmentFiles(
          activeAttachments
            .filter(
              (attachment) => attachment.serviceRecordId === recordId,
            )
            .map((attachment) => attachment.storagePath),
        )
        await deleteServiceRecordMutation.mutateAsync(recordId)
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

    resetMutationErrors()
    void uploadServiceAttachmentMutation
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
        resetMutationErrors()
        await deleteServiceAttachmentMutation.mutateAsync({
          attachmentId,
          storagePath: attachment.storagePath,
        })
        appToast.success(t('notifications.attachmentDeleted'))
      },
    })
  }

  const createReminder = async (input: MaintenanceReminderInput) => {
    if (!activeVehicle) return

    resetMutationErrors()
    await createMaintenanceReminderMutation.mutateAsync({
      vehicleId: activeVehicle.id,
      input,
    })
    appToast.success(t('notifications.reminderCreated'))
  }

  const createFuel = async (input: FuelEntryInput) => {
    if (!activeVehicle) return

    resetMutationErrors()
    await createFuelEntryMutation.mutateAsync({
      vehicleId: activeVehicle.id,
      input,
    })
    appToast.success(t('notifications.fuelCreated'))
  }

  const updateFuel = async (
    fuelEntryId: string,
    input: FuelEntryInput,
  ) => {
    resetMutationErrors()
    await updateFuelEntryMutation.mutateAsync({ fuelEntryId, input })
    appToast.success(t('notifications.fuelUpdated'))
  }

  const uploadFuelEntryAttachment = (fuelEntryId: string, file: File) => {
    const validationError = validateAttachment(file)
    if (validationError) {
      appToast.error(t(`attachments.errors.${validationError}`))
      return
    }

    resetMutationErrors()
    void uploadFuelAttachmentMutation
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
        resetMutationErrors()
        await deleteFuelAttachmentMutation.mutateAsync({
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
        resetMutationErrors()
        await cleanupAttachmentFiles(
          activeFuelAttachments
            .filter((attachment) => attachment.fuelEntryId === fuelEntryId)
            .map((attachment) => attachment.storagePath),
        )
        await deleteFuelEntryMutation.mutateAsync(fuelEntryId)
        appToast.success(t('notifications.fuelDeleted'))
      },
    })
  }

  const toggleReminder = (reminderId: string, completed: boolean) => {
    resetMutationErrors()
    void setMaintenanceReminderCompletedMutation
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
        resetMutationErrors()
        await deleteMaintenanceReminderMutation.mutateAsync(reminderId)
        appToast.success(t('notifications.reminderDeleted'))
      },
    })
  }

  const dataError = stateQuery.error ?? mutationError
  const handleDataError = () => {
    resetMutationErrors()
    if (stateQuery.error) void stateQuery.refetch()
  }

  if (stateQuery.isPending) {
    return <LoadingScreen message={t('app.loadingGarage')} />
  }

  if (stateQuery.isError && !stateQuery.data) {
    return (
      <ErrorScreen
        message={getErrorMessage(dataError, t('app.unknownError'))}
        onRetry={() => void stateQuery.refetch()}
      />
    )
  }

  const vehicleRouteRedirect = getVehicleRouteRedirect(
    state.vehicles,
    routeVehicleId,
  )

  if (vehicleRouteRedirect) {
    return <Navigate replace to={vehicleRouteRedirect} />
  }

  if (routeVehicleId && routeSectionParam === 'overview') {
    return <Navigate replace to={getVehiclePath(routeVehicleId)} />
  }

  if (routeVehicleId && !vehicleSection) {
    return <Navigate replace to={getVehiclePath(routeVehicleId)} />
  }

  return (
    <div
      className="mx-auto flex min-h-svh w-[calc(100%_-_40px)] max-w-[1180px] flex-col max-[700px]:w-[calc(100%_-_28px)]"
      aria-busy={isMutating}
    >
      <AppHeader
        activeVehicle={activeVehicle}
        userEmail={userEmail}
        vehicles={state.vehicles}
        onAddVehicle={() => setVehicleFormMode('add')}
        onSelectVehicle={selectVehicle}
        onSignOut={onSignOut}
      />

      {dataError && (
        <div
          className="mt-4 flex items-center justify-between gap-5 rounded-[10px] bg-[#fff2f2] px-4 py-3 text-[13px] text-[#852424]"
          role="alert"
        >
          <span>{getErrorMessage(dataError, t('app.unknownError'))}</span>
          <Button
            className="h-auto shrink-0 px-2 py-[5px] text-[11px]"
            size="xs"
            variant="destructive"
            type="button"
            onClick={handleDataError}
          >
            {stateQuery.error ? t('common.retry') : t('common.dismiss')}
          </Button>
        </div>
      )}

      {!activeVehicle ? (
        <main className="grid flex-1 grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)] items-center gap-[clamp(48px,8vw,110px)] py-16 max-[900px]:grid-cols-1 max-[900px]:items-start max-[900px]:gap-10 max-[900px]:py-12">
          <PageHeader
            className="max-w-[590px]"
            description={t('app.emptyDescription')}
            eyebrow={t('app.emptyEyebrow')}
            size="hero"
            title={t('app.emptyTitle')}
          />
          <VehicleForm
            defaultDistanceUnit={defaultDistanceUnit}
            isSaving={createVehicleMutation.isPending}
            onSave={addVehicle}
          />
        </main>
      ) : routeVehicleId === undefined ? (
        <HomeDashboard
          fuelEntries={activeFuelEntries}
          isCreatingFuelEntry={createFuelEntryMutation.isPending}
          isCreatingReminder={createMaintenanceReminderMutation.isPending}
          isSavingRecord={createServiceRecordMutation.isPending}
          isUpdatingMileage={updateVehicleMileageMutation.isPending}
          records={activeRecords}
          reminders={activeReminders}
          userName={userName}
          vehicle={activeVehicle}
          onCreateFuelEntry={createFuel}
          onCreateReminder={createReminder}
          onCreateServiceRecord={saveServiceRecord}
          onOpenVehicle={() => navigate(getVehiclePath(activeVehicle.id))}
          onUpdateMileage={updateMileage}
        />
      ) : (
        <VehicleDashboard
          attachments={activeAttachments}
          fuelAttachments={activeFuelAttachments}
          deletingFuelAttachmentId={
            deleteFuelAttachmentMutation.isPending
              ? (deleteFuelAttachmentMutation.variables?.attachmentId ?? null)
              : null
          }
          deletingAttachmentId={
            deleteServiceAttachmentMutation.isPending
              ? (deleteServiceAttachmentMutation.variables?.attachmentId ??
                null)
              : null
          }
          editingRecordId={editingRecordId}
          isCreatingReminder={createMaintenanceReminderMutation.isPending}
          isSavingFuelEntry={
            createFuelEntryMutation.isPending ||
            updateFuelEntryMutation.isPending
          }
          isSavingRecord={
            createServiceRecordMutation.isPending ||
            updateServiceRecordMutation.isPending
          }
          isUpdatingMileage={updateVehicleMileageMutation.isPending}
          uploadingRecordId={
            uploadServiceAttachmentMutation.isPending
              ? (uploadServiceAttachmentMutation.variables?.recordId ?? null)
              : null
          }
          uploadingFuelEntryId={
            uploadFuelAttachmentMutation.isPending
              ? (uploadFuelAttachmentMutation.variables?.fuelEntryId ?? null)
              : null
          }
          reminders={activeReminders}
          section={vehicleSection ?? 'overview'}
          fuelEntries={activeFuelEntries}
          records={activeRecords}
          vehicle={activeVehicle}
          onCancelRecordEdit={() => setEditingRecordId(null)}
          onCreateReminder={createReminder}
          onCreateFuelEntry={createFuel}
          onDeleteFuelEntry={requestFuelEntryDeletion}
          onDeleteFuelAttachment={requestFuelAttachmentDeletion}
          onDeleteRecord={requestServiceRecordDeletion}
          onDeleteAttachment={requestServiceAttachmentDeletion}
          onDeleteReminder={requestReminderDeletion}
          onDeleteVehicle={requestVehicleDeletion}
          onEditRecord={setEditingRecordId}
          onEditVehicle={() => setVehicleFormMode('edit')}
          onUpdateFuelEntry={updateFuel}
          onSaveRecord={saveServiceRecord}
          onToggleReminder={toggleReminder}
          onUpdateMileage={updateMileage}
          onUploadAttachment={uploadServiceRecordAttachment}
          onUploadFuelAttachment={uploadFuelEntryAttachment}
        />
      )}

      {activeVehicle && (
        <VehicleDialog
          defaultDistanceUnit={defaultDistanceUnit}
          mode={vehicleFormMode ?? 'add'}
          open={Boolean(vehicleFormMode)}
          isSaving={
            vehicleFormMode === 'edit'
              ? updateVehicleMutation.isPending
              : createVehicleMutation.isPending
          }
          vehicle={activeVehicle}
          onClose={() => setVehicleFormMode(null)}
          onSave={vehicleFormMode === 'edit' ? updateVehicle : addVehicle}
        />
      )}

      <ConfirmDialog
        description={deleteConfirmation?.description ?? ''}
        isConfirming={isConfirmingDeletion}
        open={Boolean(deleteConfirmation)}
        title={deleteConfirmation?.title ?? ''}
        onConfirm={confirmDeletion}
        onOpenChange={(open) => {
          if (!open) closeDeleteConfirmation()
        }}
      />
    </div>
  )
}

export default CarDiaryApp

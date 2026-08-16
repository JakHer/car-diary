import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppHeader } from '@/components/layout/app-header'
import { ConfirmDialog } from '@/components/overlays/confirm-dialog'
import { ErrorScreen, LoadingScreen } from '@/components/feedback/status-screen'
import { Button } from '@/components/ui/button'
import {
  VehicleDialog,
  type VehicleFormMode,
} from '@/features/vehicles/vehicle-dialog'
import { VehicleDashboard } from '@/features/vehicles/vehicle-dashboard'
import { VehicleForm } from '@/features/vehicles/vehicle-form'
import { useCarDiary } from '@/hooks/use-car-diary'
import { appToast } from '@/lib/app-toast'
import {
  getVehiclePath,
  getVehicleRouteRedirect,
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
  version: 3,
  vehicles: [],
  activeVehicleId: null,
  serviceRecords: [],
  fuelEntries: [],
  maintenanceReminders: [],
}

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

interface CarDiaryAppProps {
  defaultDistanceUnit: DistanceUnit
  userId: string
  userEmail: string
  onSignOut: () => Promise<void>
}

interface DeleteConfirmation {
  description: string
  kind: 'vehicle' | 'service-record' | 'fuel-entry' | 'reminder'
  targetId: string
  title: string
}

const CarDiaryApp = ({
  defaultDistanceUnit,
  userId,
  userEmail,
  onSignOut,
}: CarDiaryAppProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const {
    stateQuery,
    createVehicleMutation,
    updateVehicleMutation,
    updateVehicleMileageMutation,
    deleteVehicleMutation,
    createServiceRecordMutation,
    updateServiceRecordMutation,
    deleteServiceRecordMutation,
    createFuelEntryMutation,
    deleteFuelEntryMutation,
    createMaintenanceReminderMutation,
    setMaintenanceReminderCompletedMutation,
    deleteMaintenanceReminderMutation,
    mutationError,
    isMutating,
    resetMutationErrors,
  } = useCarDiary(userId)
  const state = stateQuery.data ?? emptyState
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation | null>(null)
  const [vehicleFormMode, setVehicleFormMode] =
    useState<VehicleFormMode | null>(null)

  const activeVehicle = state.vehicles.find(
    (vehicle) => vehicle.id === vehicleId,
  )
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

  const addVehicle = (input: VehicleInput) => {
    resetMutationErrors()
    void createVehicleMutation
      .mutateAsync(input)
      .then((createdVehicleId) => {
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

  const selectVehicle = (vehicleId: string) => {
    navigate(getVehiclePath(vehicleId))
    setEditingRecordId(null)
  }

  const requestVehicleDeletion = () => {
    if (!activeVehicle) return

    const serviceCount = activeRecords.length
    const reminderCount = activeReminders.length
    const fuelEntryCount = activeFuelEntries.length
    setDeleteConfirmation({
      kind: 'vehicle',
      targetId: activeVehicle.id,
      title: t('app.deleteVehicleTitle', {
        vehicle: `${activeVehicle.make} ${activeVehicle.model}`,
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

    setDeleteConfirmation({
      kind: 'service-record',
      targetId: recordId,
      title: t('app.deleteRecordTitle', { title: record.title }),
      description: t('app.deleteRecordDescription'),
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

  const requestFuelEntryDeletion = (fuelEntryId: string) => {
    if (!activeFuelEntries.some((entry) => entry.id === fuelEntryId)) return

    setDeleteConfirmation({
      kind: 'fuel-entry',
      targetId: fuelEntryId,
      title: t('app.deleteFuelEntryTitle'),
      description: t('app.deleteFuelEntryDescription'),
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

    setDeleteConfirmation({
      kind: 'reminder',
      targetId: reminderId,
      title: t('app.deleteReminderTitle', { title: reminder.title }),
      description: t('app.deleteReminderDescription'),
    })
  }

  const confirmDeletion = () => {
    if (!deleteConfirmation) return

    resetMutationErrors()
    const { kind, targetId } = deleteConfirmation
    const closeDialog = () => setDeleteConfirmation(null)

    if (kind === 'vehicle') {
      const fallbackVehicle = state.vehicles.find(
        (vehicle) => vehicle.id !== targetId,
      )

      void deleteVehicleMutation
        .mutateAsync(targetId)
        .then(() => {
          navigate(
            fallbackVehicle ? getVehiclePath(fallbackVehicle.id) : '/',
            { replace: true },
          )
          setEditingRecordId(null)
          setVehicleFormMode(null)
          appToast.success(t('notifications.vehicleDeleted'))
        })
        .catch(() => undefined)
        .finally(closeDialog)
      return
    }

    if (kind === 'service-record') {
      void deleteServiceRecordMutation
        .mutateAsync(targetId)
        .then(() => {
          if (editingRecordId === targetId) setEditingRecordId(null)
          appToast.success(t('notifications.serviceDeleted'))
        })
        .catch(() => undefined)
        .finally(closeDialog)
      return
    }

    if (kind === 'fuel-entry') {
      void deleteFuelEntryMutation
        .mutateAsync(targetId)
        .then(() => appToast.success(t('notifications.fuelDeleted')))
        .catch(() => undefined)
        .finally(closeDialog)
      return
    }

    void deleteMaintenanceReminderMutation
      .mutateAsync(targetId)
      .then(() => appToast.success(t('notifications.reminderDeleted')))
      .catch(() => undefined)
      .finally(closeDialog)
  }

  const isConfirmingDeletion =
    deleteConfirmation?.kind === 'vehicle'
      ? deleteVehicleMutation.isPending
      : deleteConfirmation?.kind === 'service-record'
        ? deleteServiceRecordMutation.isPending
        : deleteConfirmation?.kind === 'fuel-entry'
          ? deleteFuelEntryMutation.isPending
          : deleteConfirmation?.kind === 'reminder'
            ? deleteMaintenanceReminderMutation.isPending
            : false

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
    vehicleId,
  )

  if (vehicleRouteRedirect) {
    return <Navigate replace to={vehicleRouteRedirect} />
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
          <div className="max-w-[590px]">
            <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase">{t('app.emptyEyebrow')}</p>
            <h1 className="m-0 text-[clamp(44px,7vw,78px)] leading-[0.98] tracking-[-0.06em] text-strong">
              {t('app.emptyTitle')}
            </h1>
            <p className="mt-6 mb-0 max-w-[520px] text-base leading-[1.7] text-muted">
              {t('app.emptyDescription')}
            </p>
          </div>
          <VehicleForm
            defaultDistanceUnit={defaultDistanceUnit}
            isSaving={createVehicleMutation.isPending}
            onSave={addVehicle}
          />
        </main>
      ) : (
        <VehicleDashboard
          editingRecordId={editingRecordId}
          isCreatingReminder={createMaintenanceReminderMutation.isPending}
          isCreatingFuelEntry={createFuelEntryMutation.isPending}
          isSavingRecord={
            createServiceRecordMutation.isPending ||
            updateServiceRecordMutation.isPending
          }
          isUpdatingMileage={updateVehicleMileageMutation.isPending}
          reminders={activeReminders}
          fuelEntries={activeFuelEntries}
          records={activeRecords}
          vehicle={activeVehicle}
          onCancelRecordEdit={() => setEditingRecordId(null)}
          onCreateReminder={createReminder}
          onCreateFuelEntry={createFuel}
          onDeleteFuelEntry={requestFuelEntryDeletion}
          onDeleteRecord={requestServiceRecordDeletion}
          onDeleteReminder={requestReminderDeletion}
          onDeleteVehicle={requestVehicleDeletion}
          onEditRecord={setEditingRecordId}
          onEditVehicle={() => setVehicleFormMode('edit')}
          onSaveRecord={saveServiceRecord}
          onToggleReminder={toggleReminder}
          onUpdateMileage={updateMileage}
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
          if (!open) setDeleteConfirmation(null)
        }}
      />
    </div>
  )
}

export default CarDiaryApp

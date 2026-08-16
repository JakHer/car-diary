import { useEffect, useMemo, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { ConfirmDialog } from './components/ConfirmDialog'
import { ErrorScreen, LoadingScreen } from './components/StatusScreen'
import { Loader } from './components/Loader'
import {
  VehicleDialog,
  type VehicleFormMode,
} from './components/VehicleDialog'
import { VehicleDashboard } from './components/VehicleDashboard'
import { VehicleForm } from './components/VehicleForm'
import { useCarDiary } from './hooks/useCarDiary'
import { eyebrowStyles, joinClassNames, smallActionStyles } from './styles'
import type {
  CarDiaryState,
  MaintenanceReminderInput,
  ServiceRecordInput,
  VehicleInput,
} from './types'

const emptyState: CarDiaryState = {
  version: 3,
  vehicles: [],
  activeVehicleId: null,
  serviceRecords: [],
  maintenanceReminders: [],
}

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

interface CarDiaryAppProps {
  userId: string
  userEmail: string
  onSignOut: () => Promise<void>
}

interface DeleteConfirmation {
  description: string
  kind: 'vehicle' | 'service-record' | 'reminder'
  targetId: string
  title: string
}

const CarDiaryApp = ({ userId, userEmail, onSignOut }: CarDiaryAppProps) => {
  const {
    stateQuery,
    createVehicleMutation,
    updateVehicleMutation,
    updateVehicleMileageMutation,
    deleteVehicleMutation,
    createServiceRecordMutation,
    updateServiceRecordMutation,
    deleteServiceRecordMutation,
    createMaintenanceReminderMutation,
    setMaintenanceReminderCompletedMutation,
    deleteMaintenanceReminderMutation,
    mutationError,
    isMutating,
    resetMutationErrors,
  } = useCarDiary(userId)
  const state = stateQuery.data ?? emptyState
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation | null>(null)
  const [vehicleFormMode, setVehicleFormMode] =
    useState<VehicleFormMode | null>(null)

  useEffect(() => {
    setActiveVehicleId((currentVehicleId) =>
      state.vehicles.some((vehicle) => vehicle.id === currentVehicleId)
        ? currentVehicleId
        : (state.vehicles[0]?.id ?? null),
    )
  }, [state.vehicles])

  const activeVehicle = state.vehicles.find(
    (vehicle) => vehicle.id === activeVehicleId,
  )

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

  const addVehicle = (input: VehicleInput) => {
    resetMutationErrors()
    void createVehicleMutation
      .mutateAsync(input)
      .then((vehicleId) => {
        setActiveVehicleId(vehicleId)
        setEditingRecordId(null)
        setVehicleFormMode(null)
      })
      .catch(() => undefined)
  }

  const updateVehicle = (input: VehicleInput) => {
    if (!activeVehicle) return

    resetMutationErrors()
    void updateVehicleMutation
      .mutateAsync({ vehicleId: activeVehicle.id, input })
      .then(() => setVehicleFormMode(null))
      .catch(() => undefined)
  }

  const updateMileage = async (currentMileage: number) => {
    if (!activeVehicle) return

    resetMutationErrors()
    await updateVehicleMileageMutation.mutateAsync({
      vehicleId: activeVehicle.id,
      currentMileage,
    })
  }

  const selectVehicle = (vehicleId: string) => {
    setActiveVehicleId(vehicleId)
    setEditingRecordId(null)
  }

  const requestVehicleDeletion = () => {
    if (!activeVehicle) return

    const serviceCount = activeRecords.length
    const reminderCount = activeReminders.length
    setDeleteConfirmation({
      kind: 'vehicle',
      targetId: activeVehicle.id,
      title: `Delete ${activeVehicle.make} ${activeVehicle.model}?`,
      description: `This will permanently remove ${serviceCount} ${serviceCount === 1 ? 'service record' : 'service records'} and ${reminderCount} ${reminderCount === 1 ? 'reminder' : 'reminders'} linked to this vehicle. This action cannot be undone.`,
    })
  }

  const saveServiceRecord = (input: ServiceRecordInput) => {
    if (!activeVehicle) return

    resetMutationErrors()
    const mutation = editingRecordId
      ? updateServiceRecordMutation.mutateAsync({
          recordId: editingRecordId,
          input,
        })
      : createServiceRecordMutation.mutateAsync({
          vehicleId: activeVehicle.id,
          input,
        })

    void mutation
      .then(() => setEditingRecordId(null))
      .catch(() => undefined)
  }

  const requestServiceRecordDeletion = (recordId: string) => {
    const record = activeRecords.find((entry) => entry.id === recordId)
    if (!activeVehicle || !record) return

    setDeleteConfirmation({
      kind: 'service-record',
      targetId: recordId,
      title: `Delete “${record.title}”?`,
      description:
        'This service record will be permanently removed from the vehicle history. This action cannot be undone.',
    })
  }

  const createReminder = (input: MaintenanceReminderInput) => {
    if (!activeVehicle) return

    resetMutationErrors()
    void createMaintenanceReminderMutation
      .mutateAsync({ vehicleId: activeVehicle.id, input })
      .catch(() => undefined)
  }

  const toggleReminder = (reminderId: string, completed: boolean) => {
    resetMutationErrors()
    void setMaintenanceReminderCompletedMutation
      .mutateAsync({ reminderId, completed })
      .catch(() => undefined)
  }

  const requestReminderDeletion = (reminderId: string) => {
    const reminder = activeReminders.find((entry) => entry.id === reminderId)
    if (!reminder) return

    setDeleteConfirmation({
      kind: 'reminder',
      targetId: reminderId,
      title: `Delete “${reminder.title}”?`,
      description:
        'This maintenance reminder will be permanently removed. This action cannot be undone.',
    })
  }

  const confirmDeletion = () => {
    if (!deleteConfirmation) return

    resetMutationErrors()
    const { kind, targetId } = deleteConfirmation
    const closeDialog = () => setDeleteConfirmation(null)

    if (kind === 'vehicle') {
      void deleteVehicleMutation
        .mutateAsync(targetId)
        .then(() => {
          setActiveVehicleId(null)
          setEditingRecordId(null)
          setVehicleFormMode(null)
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
        })
        .catch(() => undefined)
        .finally(closeDialog)
      return
    }

    void deleteMaintenanceReminderMutation
      .mutateAsync(targetId)
      .catch(() => undefined)
      .finally(closeDialog)
  }

  const isConfirmingDeletion =
    deleteConfirmation?.kind === 'vehicle'
      ? deleteVehicleMutation.isPending
      : deleteConfirmation?.kind === 'service-record'
        ? deleteServiceRecordMutation.isPending
        : deleteConfirmation?.kind === 'reminder'
          ? deleteMaintenanceReminderMutation.isPending
          : false

  const dataError = stateQuery.error ?? mutationError
  const handleDataError = () => {
    resetMutationErrors()
    if (stateQuery.error) void stateQuery.refetch()
  }

  if (stateQuery.isPending) {
    return <LoadingScreen message="Loading your garage..." />
  }

  if (stateQuery.isError && !stateQuery.data) {
    return (
      <ErrorScreen
        message={getErrorMessage(dataError)}
        onRetry={() => void stateQuery.refetch()}
      />
    )
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
          <span>{getErrorMessage(dataError)}</span>
          <button
            className={joinClassNames(
              smallActionStyles,
              'shrink-0 bg-[#fbe3e3] text-[#852424] hover:bg-[#f7d1d1] hover:text-[#651919]',
            )}
            type="button"
            onClick={handleDataError}
          >
            {stateQuery.error ? 'Retry' : 'Dismiss'}
          </button>
        </div>
      )}

      {isMutating && (
        <div
          className="fixed right-5 bottom-5 z-30 rounded-full bg-strong px-4 py-2.5 text-xs font-bold text-white shadow-card"
          role="status"
        >
          <Loader label="Syncing changes..." size="small" />
        </div>
      )}

      {!activeVehicle ? (
        <main className="grid flex-1 grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)] items-center gap-[clamp(48px,8vw,110px)] py-16 max-[900px]:grid-cols-1 max-[900px]:items-start max-[900px]:gap-10 max-[900px]:py-12">
          <div className="max-w-[590px]">
            <p className={eyebrowStyles}>Your car's story starts here</p>
            <h1 className="m-0 text-[clamp(44px,7vw,78px)] leading-[0.98] tracking-[-0.06em] text-strong">
              Keep every mile and service on record.
            </h1>
            <p className="mt-6 mb-0 max-w-[520px] text-base leading-[1.7] text-muted">
              Create a vehicle profile, then log maintenance, repairs, and
              expenses as they happen.
            </p>
          </div>
          <VehicleForm
            isSaving={createVehicleMutation.isPending}
            onSave={addVehicle}
          />
        </main>
      ) : (
        <VehicleDashboard
          editingRecordId={editingRecordId}
          isCreatingReminder={createMaintenanceReminderMutation.isPending}
          isSavingRecord={
            createServiceRecordMutation.isPending ||
            updateServiceRecordMutation.isPending
          }
          isUpdatingMileage={updateVehicleMileageMutation.isPending}
          reminders={activeReminders}
          records={activeRecords}
          vehicle={activeVehicle}
          onCancelRecordEdit={() => setEditingRecordId(null)}
          onCreateReminder={createReminder}
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

import { useEffect, useState } from 'react'
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
import { useCarDiary } from '@/hooks/use-car-diary'
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation'
import {
  getVehiclePath,
  getVehicleRouteRedirect,
  getVehicleSectionPath,
  isVehicleSection,
} from '@/app/routing/vehicle-routes'
import type { CarDiaryState, DistanceUnit } from '@/types'
import { useActiveVehicleData } from './hooks/use-active-vehicle-data'
import { useAttachmentCleanup } from './hooks/use-attachment-cleanup'
import { useFuelActions } from './hooks/use-fuel-actions'
import { useReminderActions } from './hooks/use-reminder-actions'
import { useServiceActions } from './hooks/use-service-actions'
import { useVehicleActions } from './hooks/use-vehicle-actions'

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
  const controller = useCarDiary(userId)
  const { stateQuery, mutationError, isMutating, resetMutationErrors } =
    controller
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

  const {
    activeVehicle,
    attachments: activeAttachments,
    fuelAttachments: activeFuelAttachments,
    fuelEntries: activeFuelEntries,
    records: activeRecords,
    reminders: activeReminders,
  } = useActiveVehicleData({
    routeVehicleId,
    selectedVehicleId,
    state,
  })
  const cleanupAttachmentFiles = useAttachmentCleanup()

  const {
    addVehicle,
    requestVehicleDeletion,
    selectVehicle,
    updateMileage,
    updateVehicle,
  } = useVehicleActions({
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
    vehicles: state.vehicles,
  })

  const {
    requestServiceAttachmentDeletion,
    requestServiceRecordDeletion,
    saveServiceRecord,
    uploadServiceRecordAttachment,
  } = useServiceActions({
    activeAttachments,
    activeRecords,
    activeVehicle,
    cleanupAttachmentFiles,
    controller,
    editingRecordId,
    requestDeletion,
    setEditingRecordId,
  })

  const {
    createReminder,
    requestReminderDeletion,
    toggleReminder,
    updateReminder,
  } = useReminderActions({
    activeReminders,
    activeVehicle,
    controller,
    requestDeletion,
  })

  const {
    createFuel,
    requestFuelAttachmentDeletion,
    requestFuelEntryDeletion,
    updateFuel,
    uploadFuelEntryAttachment,
  } = useFuelActions({
    activeFuelAttachments,
    activeFuelEntries,
    activeVehicle,
    cleanupAttachmentFiles,
    controller,
    requestDeletion,
  })

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
            isSaving={controller.createVehicleMutation.isPending}
            onSave={addVehicle}
          />
        </main>
      ) : routeVehicleId === undefined ? (
        <HomeDashboard
          fuelEntries={activeFuelEntries}
          isCreatingFuelEntry={controller.createFuelEntryMutation.isPending}
          isCreatingReminder={
            controller.createMaintenanceReminderMutation.isPending
          }
          isSavingRecord={controller.createServiceRecordMutation.isPending}
          isUpdatingMileage={
            controller.updateVehicleMileageMutation.isPending
          }
          records={activeRecords}
          reminders={activeReminders}
          userName={userName}
          vehicle={activeVehicle}
          onCreateFuelEntry={createFuel}
          onCreateReminder={createReminder}
          onCreateServiceRecord={saveServiceRecord}
          onEditVehicle={() => setVehicleFormMode('edit')}
          onOpenVehicle={() => navigate(getVehiclePath(activeVehicle.id))}
          onOpenVehicleSection={(section) =>
            navigate(getVehicleSectionPath(activeVehicle.id, section))
          }
          onUpdateMileage={updateMileage}
        />
      ) : (
        <VehicleDashboard
          attachments={activeAttachments}
          fuelAttachments={activeFuelAttachments}
          deletingFuelAttachmentId={
            controller.deleteFuelAttachmentMutation.isPending
              ? (controller.deleteFuelAttachmentMutation.variables
                  ?.attachmentId ?? null)
              : null
          }
          deletingAttachmentId={
            controller.deleteServiceAttachmentMutation.isPending
              ? (controller.deleteServiceAttachmentMutation.variables
                  ?.attachmentId ?? null)
              : null
          }
          editingRecordId={editingRecordId}
          isSavingReminder={
            controller.createMaintenanceReminderMutation.isPending ||
            controller.updateMaintenanceReminderMutation.isPending
          }
          isSavingFuelEntry={
            controller.createFuelEntryMutation.isPending ||
            controller.updateFuelEntryMutation.isPending
          }
          isSavingRecord={
            controller.createServiceRecordMutation.isPending ||
            controller.updateServiceRecordMutation.isPending
          }
          isUpdatingMileage={
            controller.updateVehicleMileageMutation.isPending
          }
          uploadingRecordId={
            controller.uploadServiceAttachmentMutation.isPending
              ? (controller.uploadServiceAttachmentMutation.variables
                  ?.recordId ?? null)
              : null
          }
          uploadingFuelEntryId={
            controller.uploadFuelAttachmentMutation.isPending
              ? (controller.uploadFuelAttachmentMutation.variables
                  ?.fuelEntryId ?? null)
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
          onUpdateReminder={updateReminder}
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
              ? controller.updateVehicleMutation.isPending
              : controller.createVehicleMutation.isPending
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

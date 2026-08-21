import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { VehicleSection } from '@/app/routing/vehicle-routes'
import type {
  FuelAttachment,
  FuelEntry,
  FuelEntryInput,
  MaintenanceReminder,
  MaintenanceReminderInput,
  ServiceAttachment,
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
} from '@/types'
import { getIntlLocale } from '@/i18n'
import { FuelLog } from '@/features/fuel/fuel-log'
import { MaintenanceReminders } from '@/features/reminders/maintenance-reminders'
import { ServiceForm } from '@/features/service-records/service-form'
import { ServiceHistory } from '@/features/service-records/service-history'
import { FormDialog } from '@/components/overlays/form-dialog'
import { PageLayout } from '@/components/layout/page-layout'
import { VehicleOverview } from './vehicle-overview'
import { VehiclePageHeader } from './vehicle-page-header'
import { VehicleSectionNavigation } from './vehicle-section-navigation'

interface VehicleDashboardProps {
  attachments: ServiceAttachment[]
  deletingAttachmentId: string | null
  deletingFuelAttachmentId: string | null
  editingRecordId: string | null
  fuelAttachments: FuelAttachment[]
  fuelEntries: FuelEntry[]
  isCreatingReminder: boolean
  isSavingFuelEntry: boolean
  isSavingRecord: boolean
  isUpdatingMileage: boolean
  records: ServiceRecord[]
  reminders: MaintenanceReminder[]
  section: VehicleSection
  uploadingFuelEntryId: string | null
  uploadingRecordId: string | null
  vehicle: Vehicle
  onCancelRecordEdit: () => void
  onCreateFuelEntry: (input: FuelEntryInput) => Promise<void>
  onCreateReminder: (input: MaintenanceReminderInput) => Promise<void>
  onDeleteAttachment: (attachmentId: string) => void
  onDeleteFuelAttachment: (attachmentId: string) => void
  onDeleteFuelEntry: (fuelEntryId: string) => void
  onDeleteRecord: (recordId: string) => void
  onDeleteReminder: (reminderId: string) => void
  onDeleteVehicle: () => void
  onEditRecord: (recordId: string) => void
  onEditVehicle: () => void
  onSaveRecord: (input: ServiceRecordInput) => Promise<void>
  onToggleReminder: (reminderId: string, completed: boolean) => void
  onUpdateFuelEntry: (
    fuelEntryId: string,
    input: FuelEntryInput,
  ) => Promise<void>
  onUpdateMileage: (currentMileage: number) => Promise<void>
  onUploadAttachment: (recordId: string, file: File) => void
  onUploadFuelAttachment: (fuelEntryId: string, file: File) => void
}

export const VehicleDashboard = ({
  attachments,
  deletingAttachmentId,
  deletingFuelAttachmentId,
  editingRecordId,
  fuelAttachments,
  fuelEntries,
  isCreatingReminder,
  isSavingFuelEntry,
  isSavingRecord,
  isUpdatingMileage,
  records,
  reminders,
  section,
  uploadingFuelEntryId,
  uploadingRecordId,
  vehicle,
  onCancelRecordEdit,
  onCreateFuelEntry,
  onCreateReminder,
  onDeleteAttachment,
  onDeleteFuelAttachment,
  onDeleteFuelEntry,
  onDeleteRecord,
  onDeleteReminder,
  onDeleteVehicle,
  onEditRecord,
  onEditVehicle,
  onSaveRecord,
  onToggleReminder,
  onUpdateFuelEntry,
  onUpdateMileage,
  onUploadAttachment,
  onUploadFuelAttachment,
}: VehicleDashboardProps) => {
  const { i18n, t } = useTranslation()
  const [serviceFormOpen, setServiceFormOpen] = useState(
    Boolean(editingRecordId),
  )
  const locale = getIntlLocale(i18n.resolvedLanguage)
  const editingRecord = records.find(
    (record) => record.id === editingRecordId,
  )
  const openNewServiceRecord = () => {
    onCancelRecordEdit()
    setServiceFormOpen(true)
  }
  const openServiceRecordEdit = (recordId: string) => {
    onEditRecord(recordId)
    setServiceFormOpen(true)
  }
  const handleServiceDialogChange = (open: boolean) => {
    setServiceFormOpen(open)
    if (!open) onCancelRecordEdit()
  }
  const saveServiceRecord = async (input: ServiceRecordInput) => {
    try {
      await onSaveRecord(input)
    } catch {
      return
    }

    setServiceFormOpen(false)
  }

  return (
    <PageLayout>
      <VehiclePageHeader
        isUpdatingMileage={isUpdatingMileage}
        locale={locale}
        vehicle={vehicle}
        onDeleteVehicle={onDeleteVehicle}
        onEditVehicle={onEditVehicle}
        onUpdateMileage={onUpdateMileage}
      />
      <VehicleSectionNavigation vehicleId={vehicle.id} />

      {section === 'overview' && (
        <VehicleOverview
          fuelEntries={fuelEntries}
          locale={locale}
          records={records}
          reminders={reminders}
          vehicleId={vehicle.id}
        />
      )}

      {section === 'fuel' && (
        <FuelLog
          attachments={fuelAttachments}
          currentMileage={vehicle.currentMileage}
          deletingAttachmentId={deletingFuelAttachmentId}
          distanceUnit={vehicle.distanceUnit}
          entries={fuelEntries}
          isSaving={isSavingFuelEntry}
          uploadingFuelEntryId={uploadingFuelEntryId}
          onCreate={onCreateFuelEntry}
          onDelete={onDeleteFuelEntry}
          onDeleteAttachment={onDeleteFuelAttachment}
          onUpdate={onUpdateFuelEntry}
          onUploadAttachment={onUploadFuelAttachment}
        />
      )}

      {section === 'reminders' && (
        <MaintenanceReminders
          currentMileage={vehicle.currentMileage}
          distanceUnit={vehicle.distanceUnit}
          isSaving={isCreatingReminder}
          reminders={reminders}
          onCreate={onCreateReminder}
          onDelete={onDeleteReminder}
          onToggleCompleted={onToggleReminder}
        />
      )}

      {section === 'service' && (
        <div className="mt-6">
          <ServiceHistory
            attachments={attachments}
            deletingAttachmentId={deletingAttachmentId}
            distanceUnit={vehicle.distanceUnit}
            editingRecordId={editingRecordId}
            records={records}
            uploadingRecordId={uploadingRecordId}
            onAdd={openNewServiceRecord}
            onDelete={onDeleteRecord}
            onDeleteAttachment={onDeleteAttachment}
            onEdit={openServiceRecordEdit}
            onUploadAttachment={onUploadAttachment}
          />
        </div>
      )}

      <FormDialog
        closeLabel={t('service.close')}
        description={
          editingRecord
            ? t('service.editDescription')
            : t('service.addDescription')
        }
        isBusy={isSavingRecord}
        open={serviceFormOpen}
        title={
          editingRecord ? t('service.editTitle') : t('service.addTitle')
        }
        onOpenChange={handleServiceDialogChange}
      >
        <ServiceForm
          key={editingRecord?.id ?? `new-${records.length}`}
          currentMileage={vehicle.currentMileage}
          distanceUnit={vehicle.distanceUnit}
          embedded
          isSaving={isSavingRecord}
          record={editingRecord}
          onCancel={() => handleServiceDialogChange(false)}
          onSave={saveServiceRecord}
        />
      </FormDialog>
    </PageLayout>
  )
}

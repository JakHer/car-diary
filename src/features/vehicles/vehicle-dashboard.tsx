import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { MaintenanceReminders } from '@/features/reminders/maintenance-reminders'
import { FuelLog } from '@/features/fuel/fuel-log'
import { FormDialog } from '@/components/overlays/form-dialog'
import { IconButton } from '@/components/actions/icon-button'
import { StatCard } from '@/components/data-display/stat-card'
import { PageHeader } from '@/components/layout/page-header'
import { PageLayout } from '@/components/layout/page-layout'
import { MileageDialog } from './mileage-dialog'
import { ServiceForm } from '@/features/service-records/service-form'
import { ServiceHistory } from '@/features/service-records/service-history'
import { Badge } from '@/components/ui/badge'
import type {
  MaintenanceReminder,
  MaintenanceReminderInput,
  FuelEntry,
  FuelEntryInput,
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
} from '@/types'
import { getIntlLocale } from '@/i18n'

interface VehicleDashboardProps {
  editingRecordId: string | null
  isCreatingReminder: boolean
  isCreatingFuelEntry: boolean
  isSavingRecord: boolean
  isUpdatingMileage: boolean
  reminders: MaintenanceReminder[]
  fuelEntries: FuelEntry[]
  records: ServiceRecord[]
  vehicle: Vehicle
  onCancelRecordEdit: () => void
  onCreateReminder: (input: MaintenanceReminderInput) => Promise<void>
  onCreateFuelEntry: (input: FuelEntryInput) => Promise<void>
  onDeleteFuelEntry: (fuelEntryId: string) => void
  onDeleteRecord: (recordId: string) => void
  onDeleteReminder: (reminderId: string) => void
  onDeleteVehicle: () => void
  onEditRecord: (recordId: string) => void
  onEditVehicle: () => void
  onSaveRecord: (input: ServiceRecordInput) => Promise<void>
  onToggleReminder: (reminderId: string, completed: boolean) => void
  onUpdateMileage: (currentMileage: number) => Promise<void>
}

export const VehicleDashboard = ({
  editingRecordId,
  isCreatingReminder,
  isCreatingFuelEntry,
  isSavingRecord,
  isUpdatingMileage,
  reminders,
  fuelEntries,
  records,
  vehicle,
  onCancelRecordEdit,
  onCreateReminder,
  onCreateFuelEntry,
  onDeleteFuelEntry,
  onDeleteRecord,
  onDeleteReminder,
  onDeleteVehicle,
  onEditRecord,
  onEditVehicle,
  onSaveRecord,
  onToggleReminder,
  onUpdateMileage,
}: VehicleDashboardProps) => {
  const { i18n, t } = useTranslation()
  const [serviceFormOpen, setServiceFormOpen] = useState(
    Boolean(editingRecordId),
  )
  const locale = getIntlLocale(i18n.resolvedLanguage)
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0,
      }),
    [locale],
  )
  const lastServiceFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  )
  const editingRecord = records.find(
    (record) => record.id === editingRecordId,
  )
  const totalCost = records.reduce(
    (sum, record) => sum + record.costInCents,
    0,
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
      <PageHeader
        aside={
          <div className="grid shrink-0 justify-items-end max-[700px]:justify-items-start">
            <span className="mb-1.5 text-xs font-bold tracking-[0.04em] text-muted uppercase">
              {t('dashboard.currentMileage')}
            </span>
            <strong className="text-[clamp(32px,5vw,48px)] leading-none tracking-[-0.04em] text-strong">
              {vehicle.currentMileage.toLocaleString(locale)}
              <small className="ml-1 text-[0.45em] tracking-normal text-muted">
                {vehicle.distanceUnit}
              </small>
            </strong>
            <MileageDialog
              currentMileage={vehicle.currentMileage}
              distanceUnit={vehicle.distanceUnit}
              isSaving={isUpdatingMileage}
              vehicleName={`${vehicle.make} ${vehicle.model}`}
              onSave={onUpdateMileage}
            />
          </div>
        }
        eyebrow={t('dashboard.activeVehicle')}
        size="display"
        title={`${vehicle.make} ${vehicle.model}`}
      >
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{vehicle.year}</Badge>
            {vehicle.registrationNumber && (
              <Badge variant="secondary">{vehicle.registrationNumber}</Badge>
            )}
            {vehicle.vin && (
              <Badge variant="secondary">VIN {vehicle.vin}</Badge>
            )}
            <div className="ml-1 flex gap-1.5 border-l border-border pl-3">
              <IconButton
                label={t('dashboard.editVehicle')}
                tooltipSide="bottom"
                onClick={onEditVehicle}
              >
                <Pencil aria-hidden="true" className="size-4" />
              </IconButton>
              <IconButton
                label={t('dashboard.deleteVehicle')}
                tooltipSide="bottom"
                variant="danger"
                onClick={onDeleteVehicle}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </IconButton>
            </div>
          </div>
      </PageHeader>

      <section
        className="mt-11 grid grid-cols-3 gap-4 max-[700px]:grid-cols-1 max-[700px]:gap-3"
        aria-label={t('dashboard.summaryAria')}
      >
        <StatCard
          description={t('dashboard.recordedForVehicle')}
          label={t('dashboard.serviceEntries')}
          value={records.length}
        />
        <StatCard
          description={t('dashboard.acrossEntries')}
          label={t('dashboard.totalServiceCost')}
          value={currencyFormatter.format(totalCost / 100)}
        />
        <StatCard
          description={records[0]?.title ?? t('dashboard.addFirstRecord')}
          label={t('dashboard.lastService')}
          value={
            records[0]
              ? lastServiceFormatter.format(
                  new Date(`${records[0].date}T12:00:00`),
                )
              : t('dashboard.notYet')
          }
        />
      </section>

      <FuelLog
        key={vehicle.id}
        currentMileage={vehicle.currentMileage}
        distanceUnit={vehicle.distanceUnit}
        entries={fuelEntries}
        isSaving={isCreatingFuelEntry}
        onCreate={onCreateFuelEntry}
        onDelete={onDeleteFuelEntry}
      />

      <MaintenanceReminders
        currentMileage={vehicle.currentMileage}
        distanceUnit={vehicle.distanceUnit}
        isSaving={isCreatingReminder}
        reminders={reminders}
        onCreate={onCreateReminder}
        onDelete={onDeleteReminder}
        onToggleCompleted={onToggleReminder}
      />

      <div className="mt-6">
        <ServiceHistory
          distanceUnit={vehicle.distanceUnit}
          records={records}
          editingRecordId={editingRecordId}
          onAdd={openNewServiceRecord}
          onDelete={onDeleteRecord}
          onEdit={openServiceRecordEdit}
        />
      </div>

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

import { MaintenanceReminders } from './MaintenanceReminders'
import { MileageDialog } from './MileageDialog'
import { ServiceForm } from './ServiceForm'
import { ServiceHistory } from './ServiceHistory'
import type {
  MaintenanceReminder,
  MaintenanceReminderInput,
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
} from '../types'
import {
  cardStyles,
  dangerActionStyles,
  eyebrowStyles,
  joinClassNames,
  smallActionStyles,
  tagStyles,
} from '../styles'
import { getIntlLocale } from '../i18n'

interface VehicleDashboardProps {
  editingRecordId: string | null
  isCreatingReminder: boolean
  isSavingRecord: boolean
  isUpdatingMileage: boolean
  reminders: MaintenanceReminder[]
  records: ServiceRecord[]
  vehicle: Vehicle
  onCancelRecordEdit: () => void
  onCreateReminder: (input: MaintenanceReminderInput) => void
  onDeleteRecord: (recordId: string) => void
  onDeleteReminder: (reminderId: string) => void
  onDeleteVehicle: () => void
  onEditRecord: (recordId: string) => void
  onEditVehicle: () => void
  onSaveRecord: (input: ServiceRecordInput) => void
  onToggleReminder: (reminderId: string, completed: boolean) => void
  onUpdateMileage: (currentMileage: number) => Promise<void>
}

export const VehicleDashboard = ({
  editingRecordId,
  isCreatingReminder,
  isSavingRecord,
  isUpdatingMileage,
  reminders,
  records,
  vehicle,
  onCancelRecordEdit,
  onCreateReminder,
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

  return (
    <main className="py-14 pb-20 max-[700px]:py-12 max-[700px]:pb-14">
      <section className="flex items-end justify-between gap-10 max-[700px]:flex-col max-[700px]:items-start">
        <div>
          <p className={eyebrowStyles}>{t('dashboard.activeVehicle')}</p>
          <h1 className="m-0 text-[clamp(36px,6vw,66px)] leading-[0.98] tracking-[-0.055em] text-strong">
            {vehicle.make} {vehicle.model}
          </h1>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className={tagStyles}>{vehicle.year}</span>
            {vehicle.registrationNumber && (
              <span className={tagStyles}>{vehicle.registrationNumber}</span>
            )}
            {vehicle.vin && (
              <span className={tagStyles}>VIN {vehicle.vin}</span>
            )}
          </div>
          <div className="mt-4 flex gap-1.5">
            <button
              className={smallActionStyles}
              type="button"
              onClick={onEditVehicle}
            >
              {t('dashboard.editVehicle')}
            </button>
            <button
              className={dangerActionStyles}
              type="button"
              onClick={onDeleteVehicle}
            >
              {t('dashboard.deleteVehicle')}
            </button>
          </div>
        </div>
        <div className="grid shrink-0 justify-items-end max-[700px]:justify-items-start">
          <span className="mb-1.5 text-xs font-bold tracking-[0.04em] text-muted uppercase">
            {t('dashboard.currentMileage')}
          </span>
          <strong className="text-[clamp(32px,5vw,48px)] leading-none tracking-[-0.04em] text-strong">
            {vehicle.currentMileage.toLocaleString(locale)}
            <small className="text-base font-bold tracking-normal text-muted">
              {' '}
              km
            </small>
          </strong>
          <MileageDialog
            currentMileage={vehicle.currentMileage}
            isSaving={isUpdatingMileage}
            vehicleName={`${vehicle.make} ${vehicle.model}`}
            onSave={onUpdateMileage}
          />
        </div>
      </section>

      <section
        className="mt-11 grid grid-cols-3 gap-4 max-[700px]:grid-cols-1 max-[700px]:gap-3"
        aria-label={t('dashboard.summaryAria')}
      >
        <article className={joinClassNames(cardStyles, 'p-[22px]')}>
          <span className="text-xs font-bold tracking-[0.03em] text-muted uppercase">
            {t('dashboard.serviceEntries')}
          </span>
          <strong className="mt-3 block text-[30px] tracking-[-0.03em] text-strong">
            {records.length}
          </strong>
          <p className="mt-1 mb-0 text-xs text-muted">
            {t('dashboard.recordedForVehicle')}
          </p>
        </article>
        <article className={joinClassNames(cardStyles, 'p-[22px]')}>
          <span className="text-xs font-bold tracking-[0.03em] text-muted uppercase">
            {t('dashboard.totalServiceCost')}
          </span>
          <strong className="mt-3 block text-[30px] tracking-[-0.03em] text-strong">
            {currencyFormatter.format(totalCost / 100)}
          </strong>
          <p className="mt-1 mb-0 text-xs text-muted">
            {t('dashboard.acrossEntries')}
          </p>
        </article>
        <article className={joinClassNames(cardStyles, 'p-[22px]')}>
          <span className="text-xs font-bold tracking-[0.03em] text-muted uppercase">
            {t('dashboard.lastService')}
          </span>
          <strong className="mt-3 block text-[30px] tracking-[-0.03em] text-strong">
            {records[0]
              ? lastServiceFormatter.format(
                  new Date(`${records[0].date}T12:00:00`),
                )
              : t('dashboard.notYet')}
          </strong>
          <p className="mt-1 mb-0 text-xs text-muted">
            {records[0]?.title ?? t('dashboard.addFirstRecord')}
          </p>
        </article>
      </section>

      <MaintenanceReminders
        currentMileage={vehicle.currentMileage}
        isSaving={isCreatingReminder}
        reminders={reminders}
        onCreate={onCreateReminder}
        onDelete={onDeleteReminder}
        onToggleCompleted={onToggleReminder}
      />

      <div className="mt-6 grid grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)] items-start gap-6 max-[980px]:grid-cols-1">
        <ServiceHistory
          records={records}
          editingRecordId={editingRecordId}
          onDelete={onDeleteRecord}
          onEdit={onEditRecord}
        />
        <ServiceForm
          key={editingRecord?.id ?? `new-${records.length}`}
          currentMileage={vehicle.currentMileage}
          isSaving={isSavingRecord}
          record={editingRecord}
          onCancel={onCancelRecordEdit}
          onSave={onSaveRecord}
        />
      </div>
    </main>
  )
}
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

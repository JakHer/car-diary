import { MaintenanceReminders } from './MaintenanceReminders'
import { ServiceForm } from './ServiceForm'
import { ServiceHistory } from './ServiceHistory'
import type {
  MaintenanceReminder,
  MaintenanceReminderInput,
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
} from '../types'

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

const lastServiceFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
})

interface VehicleDashboardProps {
  editingRecordId: string | null
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
}

export const VehicleDashboard = ({
  editingRecordId,
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
}: VehicleDashboardProps) => {
  const editingRecord = records.find(
    (record) => record.id === editingRecordId,
  )
  const totalCost = records.reduce(
    (sum, record) => sum + record.costInCents,
    0,
  )

  return (
    <main className="dashboard">
      <section className="vehicle-hero">
        <div>
          <p className="eyebrow">Active vehicle</p>
          <h1>
            {vehicle.make} {vehicle.model}
          </h1>
          <div className="vehicle-meta">
            <span>{vehicle.year}</span>
            {vehicle.registrationNumber && (
              <span>{vehicle.registrationNumber}</span>
            )}
            {vehicle.vin && <span>VIN {vehicle.vin}</span>}
          </div>
          <div className="vehicle-actions">
            <button type="button" onClick={onEditVehicle}>
              Edit vehicle
            </button>
            <button
              className="button-danger"
              type="button"
              onClick={onDeleteVehicle}
            >
              Delete vehicle
            </button>
          </div>
        </div>
        <div className="mileage-display">
          <span>Current mileage</span>
          <strong>
            {vehicle.currentMileage.toLocaleString('en-GB')}
            <small> km</small>
          </strong>
        </div>
      </section>

      <section className="summary-grid" aria-label="Vehicle summary">
        <article className="summary-card">
          <span>Service entries</span>
          <strong>{records.length}</strong>
          <p>Recorded for this vehicle</p>
        </article>
        <article className="summary-card">
          <span>Total service cost</span>
          <strong>{currencyFormatter.format(totalCost / 100)}</strong>
          <p>Across all entries</p>
        </article>
        <article className="summary-card">
          <span>Last service</span>
          <strong>
            {records[0]
              ? lastServiceFormatter.format(
                  new Date(`${records[0].date}T12:00:00`),
                )
              : 'Not yet'}
          </strong>
          <p>{records[0]?.title ?? 'Add your first record'}</p>
        </article>
      </section>

      <MaintenanceReminders
        currentMileage={vehicle.currentMileage}
        reminders={reminders}
        onCreate={onCreateReminder}
        onDelete={onDeleteReminder}
        onToggleCompleted={onToggleReminder}
      />

      <div className="workspace-grid">
        <ServiceHistory
          records={records}
          editingRecordId={editingRecordId}
          onDelete={onDeleteRecord}
          onEdit={onEditRecord}
        />
        <ServiceForm
          key={editingRecord?.id ?? `new-${records.length}`}
          currentMileage={vehicle.currentMileage}
          record={editingRecord}
          onCancel={onCancelRecordEdit}
          onSave={onSaveRecord}
        />
      </div>
    </main>
  )
}

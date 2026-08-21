import type { CarDiaryState, ServiceAttachment } from '@/types'
import {
  fetchVehicles,
  mapVehicle,
  type VehicleRow,
} from '@/features/vehicles/vehicle-repository'
import {
  fetchServiceRecords,
  mapServiceRecord,
  type ServiceRecordRow,
} from '@/features/service-records/service-record-repository'
import {
  fetchFuelEntries,
  mapFuelEntry,
  type FuelEntryRow,
} from '@/features/fuel/fuel-repository'
import {
  fetchMaintenanceReminders,
  mapMaintenanceReminder,
  type MaintenanceReminderRow,
} from '@/features/reminders/reminder-repository'
import { fetchServiceAttachments } from '@/features/service-records/service-attachment-repository'

export const mapCarDiaryState = (
  vehicleRows: VehicleRow[],
  serviceRecordRows: ServiceRecordRow[],
  reminderRows: MaintenanceReminderRow[] = [],
  fuelEntryRows: FuelEntryRow[] = [],
  serviceAttachments: ServiceAttachment[] = [],
): CarDiaryState => {
  const vehicles = vehicleRows.map(mapVehicle)

  return {
    version: 4,
    vehicles,
    activeVehicleId: vehicles[0]?.id ?? null,
    serviceRecords: serviceRecordRows.map(mapServiceRecord),
    serviceAttachments,
    fuelEntries: fuelEntryRows.map(mapFuelEntry),
    maintenanceReminders: reminderRows.map(mapMaintenanceReminder),
  }
}

export const fetchCarDiaryState = async (): Promise<CarDiaryState> => {
  const [vehicles, serviceRecords, reminders, fuelEntries, serviceAttachments] =
    await Promise.all([
      fetchVehicles(),
      fetchServiceRecords(),
      fetchMaintenanceReminders(),
      fetchFuelEntries(),
      fetchServiceAttachments(),
    ])

  return mapCarDiaryState(
    vehicles,
    serviceRecords,
    reminders,
    fuelEntries,
    serviceAttachments,
  )
}

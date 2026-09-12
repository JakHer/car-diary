import type {
  CarDiaryState,
  FuelAttachment,
  ServiceAttachment,
} from '@/types'
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
import { fetchFuelAttachments } from '@/features/fuel/fuel-attachment-repository'
import {
  fetchOdometerReadings,
  mapOdometerReading,
  type OdometerReadingRow,
} from '@/features/vehicles/odometer-reading-repository'

export const mapCarDiaryState = (
  vehicleRows: VehicleRow[],
  serviceRecordRows: ServiceRecordRow[],
  reminderRows: MaintenanceReminderRow[] = [],
  fuelEntryRows: FuelEntryRow[] = [],
  serviceAttachments: ServiceAttachment[] = [],
  fuelAttachments: FuelAttachment[] = [],
  odometerReadingRows: OdometerReadingRow[] = [],
): CarDiaryState => {
  const vehicles = vehicleRows.map(mapVehicle)

  return {
    version: 6,
    vehicles,
    activeVehicleId: vehicles[0]?.id ?? null,
    serviceRecords: serviceRecordRows.map(mapServiceRecord),
    serviceAttachments,
    fuelEntries: fuelEntryRows.map(mapFuelEntry),
    fuelAttachments,
    odometerReadings: odometerReadingRows.map(mapOdometerReading),
    maintenanceReminders: reminderRows.map(mapMaintenanceReminder),
  }
}

export const fetchCarDiaryState = async (): Promise<CarDiaryState> => {
  const [
    vehicles,
    serviceRecords,
    reminders,
    fuelEntries,
    serviceAttachments,
    fuelAttachments,
    odometerReadings,
  ] = await Promise.all([
    fetchVehicles(),
    fetchServiceRecords(),
    fetchMaintenanceReminders(),
    fetchFuelEntries(),
    fetchServiceAttachments(),
    fetchFuelAttachments(),
    fetchOdometerReadings(),
  ])

  return mapCarDiaryState(
    vehicles,
    serviceRecords,
    reminders,
    fuelEntries,
    serviceAttachments,
    fuelAttachments,
    odometerReadings,
  )
}

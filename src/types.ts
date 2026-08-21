export type ServiceCategory =
  | 'Maintenance'
  | 'Repair'
  | 'Inspection'
  | 'Tires'
  | 'Other'

export type DistanceUnit = 'km' | 'mi'

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  registrationNumber: string
  vin: string
  distanceUnit: DistanceUnit
  startingMileage: number
  currentMileage: number
  createdAt: string
}

export type VehicleInput = Omit<Vehicle, 'id' | 'startingMileage' | 'createdAt'>

export interface ServiceRecord {
  id: string
  vehicleId: string
  title: string
  category: ServiceCategory
  date: string
  mileage: number
  workshop: string
  costInCents: number
  notes: string
  createdAt: string
}

export type ServiceRecordInput = Omit<
  ServiceRecord,
  'id' | 'vehicleId' | 'createdAt'
>

export interface FileAttachment {
  id: string
  storagePath: string
  fileName: string
  mimeType: string
  sizeBytes: number
  signedUrl: string
  createdAt: string
}

export interface ServiceAttachment extends FileAttachment {
  serviceRecordId: string
}

export interface FuelAttachment extends FileAttachment {
  fuelEntryId: string
}

export interface FuelEntry {
  id: string
  vehicleId: string
  date: string
  mileage: number
  volumeInMilliliters: number
  totalCostInCents: number
  station: string
  fullTank: boolean
  createdAt: string
}

export type FuelEntryInput = Omit<
  FuelEntry,
  'id' | 'vehicleId' | 'createdAt'
>

export interface MaintenanceReminder {
  id: string
  vehicleId: string
  title: string
  dueDate: string | null
  dueMileage: number | null
  completedAt: string | null
  createdAt: string
}

export type MaintenanceReminderInput = Pick<
  MaintenanceReminder,
  'title' | 'dueDate' | 'dueMileage'
>

export interface CarDiaryState {
  version: 5
  vehicles: Vehicle[]
  activeVehicleId: string | null
  serviceRecords: ServiceRecord[]
  serviceAttachments: ServiceAttachment[]
  fuelEntries: FuelEntry[]
  fuelAttachments: FuelAttachment[]
  maintenanceReminders: MaintenanceReminder[]
}

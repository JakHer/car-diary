export type ServiceCategory =
  | 'Maintenance'
  | 'Repair'
  | 'Inspection'
  | 'Tires'
  | 'Other'

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  registrationNumber: string
  vin: string
  currentMileage: number
  createdAt: string
}

export type VehicleInput = Omit<Vehicle, 'id' | 'createdAt'>

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

export interface CarDiaryState {
  version: 1
  vehicles: Vehicle[]
  activeVehicleId: string | null
  serviceRecords: ServiceRecord[]
}

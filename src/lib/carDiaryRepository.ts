import type {
  CarDiaryState,
  DistanceUnit,
  MaintenanceReminder,
  MaintenanceReminderInput,
  ServiceCategory,
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
  VehicleInput,
} from '../types'
import type { Database } from '../database.types'
import { getSupabaseClient } from './supabase'
import { isDistanceUnit } from './distanceUnits'

export type VehicleRow = Database['public']['Tables']['vehicles']['Row']
export type MaintenanceReminderRow =
  Database['public']['Tables']['maintenance_reminders']['Row']
export type ServiceRecordRow =
  Database['public']['Tables']['service_records']['Row']
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']
type MaintenanceReminderInsert =
  Database['public']['Tables']['maintenance_reminders']['Insert']
type ServiceRecordInsert =
  Database['public']['Tables']['service_records']['Insert']

const toServiceCategory = (category: string): ServiceCategory => {
  switch (category) {
    case 'Maintenance':
    case 'Repair':
    case 'Inspection':
    case 'Tires':
    case 'Other':
      return category
    default:
      throw new Error(`Unknown service category: ${category}`)
  }
}

const toDistanceUnit = (unit: string): DistanceUnit => {
  if (isDistanceUnit(unit)) return unit
  throw new Error(`Unknown distance unit: ${unit}`)
}

const mapRecord = (row: ServiceRecordRow): ServiceRecord => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  title: row.title,
  category: toServiceCategory(row.category),
  date: row.service_date,
  mileage: row.mileage,
  workshop: row.workshop,
  costInCents: row.cost_in_cents,
  notes: row.notes,
  createdAt: row.created_at,
})

const mapReminder = (row: MaintenanceReminderRow): MaintenanceReminder => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  title: row.title,
  dueDate: row.due_date,
  dueMileage: row.due_mileage,
  completedAt: row.completed_at,
  createdAt: row.created_at,
})

const mapVehicle = (row: VehicleRow): Vehicle => ({
  id: row.id,
  make: row.make,
  model: row.model,
  year: row.year,
  registrationNumber: row.registration_number,
  vin: row.vin,
  distanceUnit: toDistanceUnit(row.distance_unit),
  startingMileage: row.starting_mileage,
  currentMileage: row.current_mileage,
  createdAt: row.created_at,
})

const toVehicleInsertRow = (input: VehicleInput): VehicleInsert => ({
  make: input.make,
  model: input.model,
  year: input.year,
  registration_number: input.registrationNumber,
  vin: input.vin,
  distance_unit: input.distanceUnit,
  starting_mileage: input.currentMileage,
  current_mileage: input.currentMileage,
})

const toVehicleUpdateRow = (input: VehicleInput): VehicleUpdate => ({
  make: input.make,
  model: input.model,
  year: input.year,
  registration_number: input.registrationNumber,
  vin: input.vin,
  current_mileage: input.currentMileage,
})

const toServiceRecordRow = (
  input: ServiceRecordInput,
): Omit<ServiceRecordInsert, 'vehicle_id'> => ({
  title: input.title,
  category: input.category,
  service_date: input.date,
  mileage: input.mileage,
  workshop: input.workshop,
  cost_in_cents: input.costInCents,
  notes: input.notes,
})

const toMaintenanceReminderRow = (
  input: MaintenanceReminderInput,
): Omit<MaintenanceReminderInsert, 'vehicle_id'> => ({
  title: input.title,
  due_date: input.dueDate,
  due_mileage: input.dueMileage,
})

export const mapCarDiaryState = (
  vehicleRows: VehicleRow[],
  serviceRecordRows: ServiceRecordRow[],
  reminderRows: MaintenanceReminderRow[] = [],
): CarDiaryState => {
  const records = serviceRecordRows.map(mapRecord)
  const reminders = reminderRows.map(mapReminder)
  const vehicles = vehicleRows.map(mapVehicle)

  return {
    version: 3,
    vehicles,
    activeVehicleId: vehicles[0]?.id ?? null,
    serviceRecords: records,
    maintenanceReminders: reminders,
  }
}

export const fetchCarDiaryState = async (): Promise<CarDiaryState> => {
  const client = getSupabaseClient()
  const [vehiclesResult, recordsResult, remindersResult] = await Promise.all([
    client
      .from('vehicles')
      .select()
      .order('created_at', { ascending: true }),
    client
      .from('service_records')
      .select()
      .order('service_date', { ascending: false }),
    client
      .from('maintenance_reminders')
      .select()
      .order('created_at', { ascending: true }),
  ])

  if (vehiclesResult.error) throw vehiclesResult.error
  if (recordsResult.error) throw recordsResult.error
  if (remindersResult.error) throw remindersResult.error

  return mapCarDiaryState(
    vehiclesResult.data,
    recordsResult.data,
    remindersResult.data,
  )
}

export const createVehicle = async (input: VehicleInput): Promise<string> => {
  const { data, error } = await getSupabaseClient()
    .from('vehicles')
    .insert(toVehicleInsertRow(input))
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export const updateVehicle = async (
  vehicleId: string,
  input: VehicleInput,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('vehicles')
    .update(toVehicleUpdateRow(input))
    .eq('id', vehicleId)

  if (error) throw error
}

export const updateVehicleMileage = async (
  vehicleId: string,
  currentMileage: number,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('vehicles')
    .update({ current_mileage: currentMileage })
    .eq('id', vehicleId)

  if (error) throw error
}

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('vehicles')
    .delete()
    .eq('id', vehicleId)

  if (error) throw error
}

export const createServiceRecord = async (
  vehicleId: string,
  input: ServiceRecordInput,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('service_records')
    .insert({ vehicle_id: vehicleId, ...toServiceRecordRow(input) })

  if (error) throw error
}

export const updateServiceRecord = async (
  recordId: string,
  input: ServiceRecordInput,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('service_records')
    .update(toServiceRecordRow(input))
    .eq('id', recordId)

  if (error) throw error
}

export const deleteServiceRecord = async (recordId: string): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('service_records')
    .delete()
    .eq('id', recordId)

  if (error) throw error
}

export const createMaintenanceReminder = async (
  vehicleId: string,
  input: MaintenanceReminderInput,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('maintenance_reminders')
    .insert({ vehicle_id: vehicleId, ...toMaintenanceReminderRow(input) })

  if (error) throw error
}

export const setMaintenanceReminderCompleted = async (
  reminderId: string,
  completed: boolean,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('maintenance_reminders')
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq('id', reminderId)

  if (error) throw error
}

export const deleteMaintenanceReminder = async (
  reminderId: string,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('maintenance_reminders')
    .delete()
    .eq('id', reminderId)

  if (error) throw error
}

import type {
  CarDiaryState,
  ServiceCategory,
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
  VehicleInput,
} from '../types'
import { getSupabaseClient } from './supabase'

export interface VehicleRow {
  id: string
  make: string
  model: string
  year: number
  registration_number: string
  vin: string
  starting_mileage: number
  created_at: string
}

export interface ServiceRecordRow {
  id: string
  vehicle_id: string
  title: string
  category: string
  service_date: string
  mileage: number
  workshop: string
  cost_in_cents: number
  notes: string
  created_at: string
}

const mapRecord = (row: ServiceRecordRow): ServiceRecord => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  title: row.title,
  category: row.category as ServiceCategory,
  date: row.service_date,
  mileage: row.mileage,
  workshop: row.workshop,
  costInCents: row.cost_in_cents,
  notes: row.notes,
  createdAt: row.created_at,
})

const mapVehicle = (
  row: VehicleRow,
  records: ServiceRecord[],
): Vehicle => {
  const recordedMileages = records
    .filter((record) => record.vehicleId === row.id)
    .map((record) => record.mileage)

  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    registrationNumber: row.registration_number,
    vin: row.vin,
    startingMileage: row.starting_mileage,
    currentMileage: Math.max(row.starting_mileage, ...recordedMileages),
    createdAt: row.created_at,
  }
}

const toVehicleRow = (input: VehicleInput) => ({
  make: input.make,
  model: input.model,
  year: input.year,
  registration_number: input.registrationNumber,
  vin: input.vin,
  starting_mileage: input.currentMileage,
})

const toServiceRecordRow = (input: ServiceRecordInput) => ({
  title: input.title,
  category: input.category,
  service_date: input.date,
  mileage: input.mileage,
  workshop: input.workshop,
  cost_in_cents: input.costInCents,
  notes: input.notes,
})

export const mapCarDiaryState = (
  vehicleRows: VehicleRow[],
  serviceRecordRows: ServiceRecordRow[],
): CarDiaryState => {
  const records = serviceRecordRows.map(mapRecord)
  const vehicles = vehicleRows.map((vehicle) => mapVehicle(vehicle, records))

  return {
    version: 2,
    vehicles,
    activeVehicleId: vehicles[0]?.id ?? null,
    serviceRecords: records,
  }
}

export const fetchCarDiaryState = async (): Promise<CarDiaryState> => {
  const client = getSupabaseClient()
  const [vehiclesResult, recordsResult] = await Promise.all([
    client
      .from('vehicles')
      .select(
        'id, make, model, year, registration_number, vin, starting_mileage, created_at',
      )
      .order('created_at', { ascending: true }),
    client
      .from('service_records')
      .select(
        'id, vehicle_id, title, category, service_date, mileage, workshop, cost_in_cents, notes, created_at',
      )
      .order('service_date', { ascending: false }),
  ])

  if (vehiclesResult.error) throw vehiclesResult.error
  if (recordsResult.error) throw recordsResult.error

  return mapCarDiaryState(
    vehiclesResult.data as VehicleRow[],
    recordsResult.data as ServiceRecordRow[],
  )
}

export const createVehicle = async (input: VehicleInput): Promise<string> => {
  const { data, error } = await getSupabaseClient()
    .from('vehicles')
    .insert(toVehicleRow(input))
    .select('id')
    .single()

  if (error) throw error
  return (data as { id: string }).id
}

export const updateVehicle = async (
  vehicleId: string,
  input: VehicleInput,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('vehicles')
    .update(toVehicleRow(input))
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

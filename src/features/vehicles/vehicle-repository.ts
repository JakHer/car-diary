import type { Database } from '@/database.types'
import type { DistanceUnit, Vehicle, VehicleInput } from '@/types'
import { isDistanceUnit } from '@/lib/distance-units'
import { getSupabaseClient } from '@/lib/supabase'

export type VehicleRow = Database['public']['Tables']['vehicles']['Row']
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']

const toDistanceUnit = (unit: string): DistanceUnit => {
  if (isDistanceUnit(unit)) return unit
  throw new Error(`Unknown distance unit: ${unit}`)
}

export const mapVehicle = (row: VehicleRow): Vehicle => ({
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

export const fetchVehicles = async (): Promise<VehicleRow[]> => {
  const { data, error } = await getSupabaseClient()
    .from('vehicles')
    .select()
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
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

import type { Database } from '@/database.types'
import type { FuelEntry, FuelEntryInput } from '@/types'
import { getSupabaseClient } from '@/lib/supabase'

export type FuelEntryRow = Database['public']['Tables']['fuel_entries']['Row']
type FuelEntryInsert =
  Database['public']['Tables']['fuel_entries']['Insert']

export const mapFuelEntry = (row: FuelEntryRow): FuelEntry => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  date: row.fueled_at,
  mileage: row.mileage,
  volumeInMilliliters: row.volume_milliliters,
  totalCostInCents: row.total_cost_in_cents,
  station: row.station,
  fullTank: row.full_tank,
  createdAt: row.created_at,
})

const toFuelEntryRow = (
  input: FuelEntryInput,
): Omit<FuelEntryInsert, 'vehicle_id'> => ({
  fueled_at: input.date,
  mileage: input.mileage,
  volume_milliliters: input.volumeInMilliliters,
  total_cost_in_cents: input.totalCostInCents,
  station: input.station,
  full_tank: input.fullTank,
})

export const fetchFuelEntries = async (): Promise<FuelEntryRow[]> => {
  const { data, error } = await getSupabaseClient()
    .from('fuel_entries')
    .select()
    .order('fueled_at', { ascending: false })

  if (error) throw error
  return data
}

export const createFuelEntry = async (
  vehicleId: string,
  input: FuelEntryInput,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('fuel_entries')
    .insert({ vehicle_id: vehicleId, ...toFuelEntryRow(input) })

  if (error) throw error
}

export const updateFuelEntry = async (
  fuelEntryId: string,
  input: FuelEntryInput,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('fuel_entries')
    .update(toFuelEntryRow(input))
    .eq('id', fuelEntryId)

  if (error) throw error
}

export const deleteFuelEntry = async (fuelEntryId: string): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('fuel_entries')
    .delete()
    .eq('id', fuelEntryId)

  if (error) throw error
}

import type { Database } from '@/database.types'
import type {
  ServiceCategory,
  ServiceRecord,
  ServiceRecordInput,
} from '@/types'
import { getSupabaseClient } from '@/lib/supabase'

export type ServiceRecordRow =
  Database['public']['Tables']['service_records']['Row']
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

export const mapServiceRecord = (row: ServiceRecordRow): ServiceRecord => ({
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

export const fetchServiceRecords = async (): Promise<ServiceRecordRow[]> => {
  const { data, error } = await getSupabaseClient()
    .from('service_records')
    .select()
    .order('service_date', { ascending: false })

  if (error) throw error
  return data
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

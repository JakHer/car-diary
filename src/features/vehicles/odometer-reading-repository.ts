import type { Database } from '@/database.types'
import type { OdometerReading, OdometerReadingSource } from '@/types'
import { getSupabaseClient } from '@/lib/supabase'

export type OdometerReadingRow =
  Database['public']['Tables']['odometer_readings']['Row']

const toOdometerReadingSource = (source: string): OdometerReadingSource => {
  switch (source) {
    case 'vehicle':
    case 'manual':
    case 'service':
    case 'fuel':
      return source
    default:
      throw new Error(`Unknown odometer reading source: ${source}`)
  }
}

export const mapOdometerReading = (
  row: OdometerReadingRow,
): OdometerReading => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  date: row.recorded_at,
  mileage: row.mileage,
  source: toOdometerReadingSource(row.source_type),
  sourceId: row.source_id,
  createdAt: row.created_at,
})

export const fetchOdometerReadings = async (): Promise<
  OdometerReadingRow[]
> => {
  const { data, error } = await getSupabaseClient()
    .from('odometer_readings')
    .select()
    .order('recorded_at', { ascending: true })
    .order('mileage', { ascending: true })

  if (error) throw error
  return data
}

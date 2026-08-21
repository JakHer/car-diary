import type { Database } from '@/database.types'
import type { MaintenanceReminder, MaintenanceReminderInput } from '@/types'
import { getSupabaseClient } from '@/lib/supabase'

export type MaintenanceReminderRow =
  Database['public']['Tables']['maintenance_reminders']['Row']
type MaintenanceReminderInsert =
  Database['public']['Tables']['maintenance_reminders']['Insert']

export const mapMaintenanceReminder = (
  row: MaintenanceReminderRow,
): MaintenanceReminder => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  title: row.title,
  dueDate: row.due_date,
  dueMileage: row.due_mileage,
  completedAt: row.completed_at,
  createdAt: row.created_at,
})

const toMaintenanceReminderRow = (
  input: MaintenanceReminderInput,
): Omit<MaintenanceReminderInsert, 'vehicle_id'> => ({
  title: input.title,
  due_date: input.dueDate,
  due_mileage: input.dueMileage,
})

export const fetchMaintenanceReminders = async (): Promise<
  MaintenanceReminderRow[]
> => {
  const { data, error } = await getSupabaseClient()
    .from('maintenance_reminders')
    .select()
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
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

export const updateMaintenanceReminder = async (
  reminderId: string,
  input: MaintenanceReminderInput,
): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from('maintenance_reminders')
    .update(toMaintenanceReminderRow(input))
    .eq('id', reminderId)

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

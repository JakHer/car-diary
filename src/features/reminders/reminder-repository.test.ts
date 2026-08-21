import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MaintenanceReminderInput } from '@/types'
import {
  createMaintenanceReminder,
  setMaintenanceReminderCompleted,
  updateMaintenanceReminder,
} from './reminder-repository'

const supabase = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: supabase.from }),
}))

const reminderInput: MaintenanceReminderInput = {
  title: 'Oil change',
  dueDate: '2026-10-01',
  dueMileage: 90_000,
}

describe('maintenance reminder repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('maps a reminder input to a database insert', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    supabase.from.mockReturnValue({ insert })

    await expect(
      createMaintenanceReminder('vehicle-1', reminderInput),
    ).resolves.toBeUndefined()
    expect(supabase.from).toHaveBeenCalledWith('maintenance_reminders')
    expect(insert).toHaveBeenCalledWith({
      vehicle_id: 'vehicle-1',
      title: 'Oil change',
      due_date: '2026-10-01',
      due_mileage: 90_000,
    })
  })

  it('writes and clears the completion timestamp', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-17T10:00:00.000Z'))
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    supabase.from.mockReturnValue({ update })

    await setMaintenanceReminderCompleted('reminder-1', true)
    await setMaintenanceReminderCompleted('reminder-1', false)

    expect(update).toHaveBeenNthCalledWith(1, {
      completed_at: '2026-08-17T10:00:00.000Z',
    })
    expect(update).toHaveBeenNthCalledWith(2, { completed_at: null })
    expect(eq).toHaveBeenCalledTimes(2)
    expect(eq).toHaveBeenCalledWith('id', 'reminder-1')
  })

  it('updates a reminder without changing its completion status', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    supabase.from.mockReturnValue({ update })

    await expect(
      updateMaintenanceReminder('reminder-1', reminderInput),
    ).resolves.toBeUndefined()

    expect(supabase.from).toHaveBeenCalledWith('maintenance_reminders')
    expect(update).toHaveBeenCalledWith({
      title: 'Oil change',
      due_date: '2026-10-01',
      due_mileage: 90_000,
    })
    expect(eq).toHaveBeenCalledWith('id', 'reminder-1')
  })
})

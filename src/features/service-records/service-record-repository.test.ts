import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ServiceRecordInput } from '@/types'
import {
  createServiceRecord,
  deleteServiceRecord,
} from './service-record-repository'

const supabase = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: supabase.from }),
}))

const recordInput: ServiceRecordInput = {
  title: 'Oil change',
  category: 'Maintenance',
  date: '2026-08-16',
  mileage: 86_200,
  workshop: 'Garage',
  costInCents: 60_000,
  notes: 'Oil and filter',
}

describe('service record repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps a service record input to a database insert', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    supabase.from.mockReturnValue({ insert })

    await expect(
      createServiceRecord('vehicle-1', recordInput),
    ).resolves.toBeUndefined()
    expect(supabase.from).toHaveBeenCalledWith('service_records')
    expect(insert).toHaveBeenCalledWith({
      vehicle_id: 'vehicle-1',
      title: 'Oil change',
      category: 'Maintenance',
      service_date: '2026-08-16',
      mileage: 86_200,
      workshop: 'Garage',
      cost_in_cents: 60_000,
      notes: 'Oil and filter',
    })
  })

  it('deletes a record by id and propagates an error', async () => {
    const error = new Error('delete failed')
    const eq = vi.fn().mockResolvedValue({ error })
    const deleteQuery = vi.fn().mockReturnValue({ eq })
    supabase.from.mockReturnValue({ delete: deleteQuery })

    await expect(deleteServiceRecord('record-1')).rejects.toBe(error)
    expect(deleteQuery).toHaveBeenCalledWith()
    expect(eq).toHaveBeenCalledWith('id', 'record-1')
  })
})

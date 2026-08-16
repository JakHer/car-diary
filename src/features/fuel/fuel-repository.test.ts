import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FuelEntryInput } from '@/types'
import { createFuelEntry, deleteFuelEntry } from './fuel-repository'

const supabase = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: supabase.from }),
}))

const fuelEntryInput: FuelEntryInput = {
  date: '2026-08-16',
  mileage: 86_200,
  volumeInMilliliters: 42_750,
  totalCostInCents: 27_500,
  station: 'Orlen',
  fullTank: true,
}

describe('fuel repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps a fuel entry input to a database insert', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    supabase.from.mockReturnValue({ insert })

    await expect(
      createFuelEntry('vehicle-1', fuelEntryInput),
    ).resolves.toBeUndefined()
    expect(supabase.from).toHaveBeenCalledWith('fuel_entries')
    expect(insert).toHaveBeenCalledWith({
      vehicle_id: 'vehicle-1',
      fueled_at: '2026-08-16',
      mileage: 86_200,
      volume_milliliters: 42_750,
      total_cost_in_cents: 27_500,
      station: 'Orlen',
      full_tank: true,
    })
  })

  it('deletes a fuel entry by id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const deleteQuery = vi.fn().mockReturnValue({ eq })
    supabase.from.mockReturnValue({ delete: deleteQuery })

    await expect(deleteFuelEntry('fuel-1')).resolves.toBeUndefined()
    expect(deleteQuery).toHaveBeenCalledWith()
    expect(eq).toHaveBeenCalledWith('id', 'fuel-1')
  })
})

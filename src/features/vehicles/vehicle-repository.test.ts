import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { VehicleInput } from '@/types'
import {
  createVehicle,
  fetchVehicles,
  updateVehicleMileage,
} from './vehicle-repository'

const supabase = vi.hoisted(() => ({
  from: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({ from: supabase.from }),
}))

const vehicleInput: VehicleInput = {
  make: 'Volvo',
  model: 'V60',
  year: 2021,
  registrationNumber: 'WA 12345',
  vin: 'YV1ZWBMV1M1234567',
  distanceUnit: 'km',
  currentMileage: 86_200,
}

describe('vehicle repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches vehicles in creation order', async () => {
    const rows = [{ id: 'vehicle-1' }]
    const order = vi.fn().mockResolvedValue({ data: rows, error: null })
    const select = vi.fn().mockReturnValue({ order })
    supabase.from.mockReturnValue({ select })

    await expect(fetchVehicles()).resolves.toBe(rows)
    expect(supabase.from).toHaveBeenCalledWith('vehicles')
    expect(select).toHaveBeenCalledWith()
    expect(order).toHaveBeenCalledWith('created_at', { ascending: true })
  })

  it('maps a vehicle input to a database insert and returns its id', async () => {
    const single = vi
      .fn()
      .mockResolvedValue({ data: { id: 'vehicle-1' }, error: null })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    supabase.from.mockReturnValue({ insert })

    await expect(createVehicle(vehicleInput)).resolves.toBe('vehicle-1')
    expect(insert).toHaveBeenCalledWith({
      make: 'Volvo',
      model: 'V60',
      year: 2021,
      registration_number: 'WA 12345',
      vin: 'YV1ZWBMV1M1234567',
      distance_unit: 'km',
      starting_mileage: 86_200,
      current_mileage: 86_200,
    })
    expect(select).toHaveBeenCalledWith('id')
  })

  it('propagates a Supabase mutation error', async () => {
    const error = new Error('update failed')
    const eq = vi.fn().mockResolvedValue({ error })
    const update = vi.fn().mockReturnValue({ eq })
    supabase.from.mockReturnValue({ update })

    await expect(updateVehicleMileage('vehicle-1', 90_000)).rejects.toBe(error)
    expect(update).toHaveBeenCalledWith({ current_mileage: 90_000 })
    expect(eq).toHaveBeenCalledWith('id', 'vehicle-1')
  })
})

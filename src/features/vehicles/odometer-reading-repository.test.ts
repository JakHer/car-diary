import { describe, expect, it } from 'vitest'
import { mapOdometerReading } from './odometer-reading-repository'

describe('mapOdometerReading', () => {
  it('maps a database row to the odometer reading domain model', () => {
    expect(
      mapOdometerReading({
        id: 'reading-1',
        vehicle_id: 'vehicle-1',
        recorded_at: '2026-09-12',
        mileage: 86_500,
        source_type: 'manual',
        source_id: null,
        created_at: '2026-09-12T10:00:00.000Z',
      }),
    ).toEqual({
      id: 'reading-1',
      vehicleId: 'vehicle-1',
      date: '2026-09-12',
      mileage: 86_500,
      source: 'manual',
      sourceId: null,
      createdAt: '2026-09-12T10:00:00.000Z',
    })
  })

  it('rejects an unknown reading source', () => {
    expect(() =>
      mapOdometerReading({
        id: 'reading-1',
        vehicle_id: 'vehicle-1',
        recorded_at: '2026-09-12',
        mileage: 86_500,
        source_type: 'unknown',
        source_id: null,
        created_at: '2026-09-12T10:00:00.000Z',
      }),
    ).toThrow('Unknown odometer reading source: unknown')
  })
})

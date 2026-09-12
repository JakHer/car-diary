import { describe, expect, it } from 'vitest'
import type { OdometerReading, OdometerReadingSource } from '@/types'
import { normalizeOdometerReadings } from './odometer-readings'

const createReading = (
  id: string,
  date: string,
  mileage: number,
  source: OdometerReadingSource,
): OdometerReading => ({
  id,
  vehicleId: 'vehicle-1',
  date,
  mileage,
  source,
  sourceId: null,
  createdAt: `${date}T12:00:00.000Z`,
})

describe('normalizeOdometerReadings', () => {
  it('removes a redundant later snapshot with unchanged mileage', () => {
    const readings = normalizeOdometerReadings([
      createReading('fuel', '2026-09-05', 47_106, 'fuel'),
      createReading('snapshot', '2026-09-12', 47_106, 'snapshot'),
    ])

    expect(readings.map(({ id }) => id)).toEqual(['fuel'])
  })

  it('keeps a snapshot that contributes a newer mileage value', () => {
    const readings = normalizeOdometerReadings([
      createReading('fuel', '2026-09-05', 47_106, 'fuel'),
      createReading('snapshot', '2026-09-12', 47_500, 'snapshot'),
    ])

    expect(readings.map(({ id }) => id)).toEqual(['fuel', 'snapshot'])
  })
})

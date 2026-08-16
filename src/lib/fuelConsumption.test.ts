import { describe, expect, it } from 'vitest'
import type { FuelEntry } from '../types'
import {
  calculateFuelConsumption,
  calculateRecordedDistanceForYear,
} from './fuelConsumption'

const createEntry = (
  id: string,
  mileage: number,
  liters: number,
  fullTank: boolean,
): FuelEntry => ({
  id,
  vehicleId: 'vehicle-1',
  date: `2026-08-${id.padStart(2, '0')}`,
  mileage,
  volumeInMilliliters: liters * 1_000,
  totalCostInCents: 20_000,
  station: '',
  fullTank,
  createdAt: `2026-08-${id.padStart(2, '0')}T12:00:00.000Z`,
})

describe('calculateFuelConsumption', () => {
  it('uses every fill-up between the first and last full tank', () => {
    const result = calculateFuelConsumption(
      [
        createEntry('1', 1_000, 40, true),
        createEntry('2', 1_200, 20, false),
        createEntry('3', 1_500, 30, true),
        createEntry('4', 1_700, 15, false),
      ],
      'km',
    )

    expect(result).toMatchObject({
      costPer100KilometersInCents: 8_000,
      distanceInKilometers: 500,
      includedEntries: 2,
      liters: 50,
      litersPer100Kilometers: 10,
      totalCostInCents: 40_000,
    })
  })

  it('converts a mileage recorded in miles to kilometers', () => {
    const result = calculateFuelConsumption(
      [
        createEntry('1', 1_000, 40, true),
        createEntry('2', 1_100, 16.09344, true),
      ],
      'mi',
    )

    expect(result?.litersPer100Kilometers).toBeCloseTo(10)
  })

  it('requires two full-tank entries with increasing mileage', () => {
    expect(
      calculateFuelConsumption([createEntry('1', 1_000, 40, true)], 'km'),
    ).toBeNull()
    expect(
      calculateFuelConsumption(
        [
          createEntry('1', 1_000, 40, true),
          createEntry('2', 1_000, 20, true),
        ],
        'km',
      ),
    ).toBeNull()
  })
})

describe('calculateRecordedDistanceForYear', () => {
  it('returns the actual distance between recorded mileages in a year', () => {
    const entries = [
      createEntry('1', 45_582, 35, false),
      createEntry('2', 45_971, 38, false),
      { ...createEntry('3', 50_000, 40, false), date: '2025-12-31' },
    ]

    expect(calculateRecordedDistanceForYear(entries, 2026)).toEqual({
      distance: 389,
      firstMileage: 45_582,
      lastMileage: 45_971,
    })
  })

  it('requires two distinct mileage readings in the selected year', () => {
    expect(
      calculateRecordedDistanceForYear(
        [createEntry('1', 45_582, 35, false)],
        2026,
      ),
    ).toBeNull()
  })
})

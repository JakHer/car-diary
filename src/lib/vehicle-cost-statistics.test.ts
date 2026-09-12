import { describe, expect, it } from 'vitest'
import type { FuelEntry, OdometerReading, ServiceRecord } from '@/types'
import {
  calculateVehicleCostStatistics,
  getVehicleStatisticsYears,
} from './vehicle-cost-statistics'

const records: ServiceRecord[] = [
  {
    id: 'service-1',
    vehicleId: 'vehicle-1',
    title: 'Oil service',
    category: 'Maintenance',
    date: '2026-01-10',
    mileage: 10_000,
    workshop: '',
    costInCents: 60_000,
    notes: '',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'service-2',
    vehicleId: 'vehicle-1',
    title: 'Inspection',
    category: 'Inspection',
    date: '2025-12-10',
    mileage: 8_000,
    workshop: '',
    costInCents: 20_000,
    notes: '',
    createdAt: '2025-12-10T10:00:00.000Z',
  },
]

const fuelEntries: FuelEntry[] = [
  {
    id: 'fuel-1',
    vehicleId: 'vehicle-1',
    date: '2026-01-20',
    mileage: 10_500,
    volumeInMilliliters: 40_000,
    totalCostInCents: 30_000,
    station: '',
    fullTank: true,
    createdAt: '2026-01-20T10:00:00.000Z',
  },
  {
    id: 'fuel-2',
    vehicleId: 'vehicle-1',
    date: '2026-03-20',
    mileage: 12_000,
    volumeInMilliliters: 42_000,
    totalCostInCents: 45_000,
    station: '',
    fullTank: true,
    createdAt: '2026-03-20T10:00:00.000Z',
  },
]

const odometerReadings: OdometerReading[] = [
  {
    id: 'reading-1',
    vehicleId: 'vehicle-1',
    date: '2026-01-10',
    mileage: 10_000,
    source: 'service',
    sourceId: 'service-1',
    createdAt: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'reading-2',
    vehicleId: 'vehicle-1',
    date: '2026-03-20',
    mileage: 12_000,
    source: 'fuel',
    sourceId: 'fuel-2',
    createdAt: '2026-03-20T10:00:00.000Z',
  },
]

describe('vehicle cost statistics', () => {
  it('calculates yearly totals, monthly costs and cost per distance unit', () => {
    const statistics = calculateVehicleCostStatistics(
      records,
      fuelEntries,
      odometerReadings,
      2026,
      new Date('2026-03-31T12:00:00.000Z'),
    )

    expect(statistics).toMatchObject({
      totalCostInCents: 135_000,
      serviceCostInCents: 60_000,
      fuelCostInCents: 75_000,
      averageMonthlyCostInCents: 45_000,
      recordedDistance: 2_000,
      costPerDistanceUnitInCents: 67.5,
      distancePeriodStart: '2026-01-10',
      distancePeriodEnd: '2026-03-20',
    })
    expect(statistics.monthlyCosts[0]).toMatchObject({
      serviceCostInCents: 60_000,
      fuelCostInCents: 30_000,
      totalCostInCents: 90_000,
    })
    expect(statistics.monthlyCosts[2].totalCostInCents).toBe(45_000)
  })

  it('returns no distance-based result with fewer than two readings', () => {
    const statistics = calculateVehicleCostStatistics(
      records,
      [],
      odometerReadings.slice(0, 1),
      2026,
      new Date('2026-03-31T12:00:00.000Z'),
    )

    expect(statistics.recordedDistance).toBeNull()
    expect(statistics.costPerDistanceUnitInCents).toBeNull()
    expect(statistics.distancePeriodStart).toBeNull()
    expect(statistics.distancePeriodEnd).toBeNull()
  })

  it('uses only costs covered by the first and last odometer reading', () => {
    const earlierRecord = {
      ...records[0],
      id: 'service-earlier',
      date: '2026-01-01',
      mileage: 9_500,
      costInCents: 100_000,
    }
    const statistics = calculateVehicleCostStatistics(
      [earlierRecord, ...records],
      fuelEntries,
      odometerReadings,
      2026,
      new Date('2026-03-31T12:00:00.000Z'),
    )

    expect(statistics.totalCostInCents).toBe(235_000)
    expect(statistics.recordedDistance).toBe(2_000)
    expect(statistics.costPerDistanceUnitInCents).toBe(67.5)
  })

  it('returns available years in descending order and includes this year', () => {
    expect(
      getVehicleStatisticsYears(records, fuelEntries, odometerReadings, 2027),
    ).toEqual([2027, 2026, 2025])
  })
})

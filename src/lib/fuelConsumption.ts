import type { DistanceUnit, FuelEntry } from '../types'

const milesToKilometers = 1.609344

export interface FuelConsumptionSummary {
  costPer100KilometersInCents: number
  distanceInKilometers: number
  includedEntries: number
  liters: number
  litersPer100Kilometers: number
  totalCostInCents: number
}

export interface RecordedDistanceSummary {
  distance: number
  firstMileage: number
  lastMileage: number
}

export const calculateRecordedDistanceForYear = (
  entries: FuelEntry[],
  year: number,
): RecordedDistanceSummary | null => {
  const yearlyEntries = entries.filter((entry) =>
    entry.date.startsWith(`${year}-`),
  )

  if (yearlyEntries.length < 2) return null

  const mileages = yearlyEntries.map((entry) => entry.mileage)
  const firstMileage = Math.min(...mileages)
  const lastMileage = Math.max(...mileages)

  if (lastMileage <= firstMileage) return null

  return {
    distance: lastMileage - firstMileage,
    firstMileage,
    lastMileage,
  }
}

export const calculateFuelConsumption = (
  entries: FuelEntry[],
  distanceUnit: DistanceUnit,
): FuelConsumptionSummary | null => {
  const orderedEntries = entries.toSorted(
    (first, second) =>
      first.mileage - second.mileage ||
      first.date.localeCompare(second.date) ||
      first.createdAt.localeCompare(second.createdAt),
  )
  const fullTankIndexes = orderedEntries.flatMap((entry, index) =>
    entry.fullTank ? [index] : [],
  )

  if (fullTankIndexes.length < 2) return null

  const firstFullTankIndex = fullTankIndexes[0]
  const lastFullTankIndex = fullTankIndexes.at(-1)!
  const distance =
    orderedEntries[lastFullTankIndex].mileage -
    orderedEntries[firstFullTankIndex].mileage

  if (distance <= 0) return null

  const includedEntries = orderedEntries.slice(
    firstFullTankIndex + 1,
    lastFullTankIndex + 1,
  )
  const liters = includedEntries.reduce(
    (total, entry) => total + entry.volumeInMilliliters / 1_000,
    0,
  )
  const totalCostInCents = includedEntries.reduce(
    (total, entry) => total + entry.totalCostInCents,
    0,
  )
  const distanceInKilometers =
    distanceUnit === 'mi' ? distance * milesToKilometers : distance

  return {
    costPer100KilometersInCents:
      (totalCostInCents / distanceInKilometers) * 100,
    distanceInKilometers,
    includedEntries: includedEntries.length,
    liters,
    litersPer100Kilometers: (liters / distanceInKilometers) * 100,
    totalCostInCents,
  }
}

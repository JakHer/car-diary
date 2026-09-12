import type { FuelEntry, OdometerReading, ServiceRecord } from '@/types'

export interface MonthlyVehicleCosts {
  monthIndex: number
  fuelCostInCents: number
  serviceCostInCents: number
  totalCostInCents: number
}

export interface VehicleCostStatistics {
  totalCostInCents: number
  fuelCostInCents: number
  serviceCostInCents: number
  averageMonthlyCostInCents: number | null
  costPerDistanceUnitInCents: number | null
  recordedDistance: number | null
  distancePeriodStart: string | null
  distancePeriodEnd: string | null
  monthlyCosts: MonthlyVehicleCosts[]
}

const getEntryYear = (date: string): number => Number(date.slice(0, 4))
const getEntryMonth = (date: string): number => Number(date.slice(5, 7)) - 1

export const getVehicleStatisticsYears = (
  records: ServiceRecord[],
  fuelEntries: FuelEntry[],
  odometerReadings: OdometerReading[],
  currentYear = new Date().getFullYear(),
): number[] =>
  [
    ...new Set([
      currentYear,
      ...records.map(({ date }) => getEntryYear(date)),
      ...fuelEntries.map(({ date }) => getEntryYear(date)),
      ...odometerReadings.map(({ date }) => getEntryYear(date)),
    ]),
  ].toSorted((first, second) => second - first)

export const calculateVehicleCostStatistics = (
  records: ServiceRecord[],
  fuelEntries: FuelEntry[],
  odometerReadings: OdometerReading[],
  year: number,
  currentDate = new Date(),
): VehicleCostStatistics => {
  const monthlyCosts = Array.from({ length: 12 }, (_, monthIndex) => ({
    monthIndex,
    fuelCostInCents: 0,
    serviceCostInCents: 0,
    totalCostInCents: 0,
  }))
  const yearRecords = records.filter(({ date }) => getEntryYear(date) === year)
  const yearFuelEntries = fuelEntries.filter(
    ({ date }) => getEntryYear(date) === year,
  )
  const yearReadings = odometerReadings
    .filter(({ date }) => getEntryYear(date) === year)
    .toSorted(
      (first, second) =>
        first.date.localeCompare(second.date) || first.mileage - second.mileage,
    )

  for (const record of yearRecords) {
    const month = monthlyCosts[getEntryMonth(record.date)]
    month.serviceCostInCents += record.costInCents
    month.totalCostInCents += record.costInCents
  }

  for (const entry of yearFuelEntries) {
    const month = monthlyCosts[getEntryMonth(entry.date)]
    month.fuelCostInCents += entry.totalCostInCents
    month.totalCostInCents += entry.totalCostInCents
  }

  const serviceCostInCents = yearRecords.reduce(
    (total, record) => total + record.costInCents,
    0,
  )
  const fuelCostInCents = yearFuelEntries.reduce(
    (total, entry) => total + entry.totalCostInCents,
    0,
  )
  const totalCostInCents = serviceCostInCents + fuelCostInCents
  const firstReading = yearReadings[0]
  const lastReading = yearReadings.at(-1)
  const recordedDistance =
    firstReading &&
    lastReading &&
    lastReading.mileage > firstReading.mileage
      ? lastReading.mileage - firstReading.mileage
      : null
  const distancePeriodCostInCents =
    firstReading && lastReading
      ? [...yearRecords, ...yearFuelEntries]
          .filter(
            ({ date }) =>
              date >= firstReading.date && date <= lastReading.date,
          )
          .reduce(
            (total, entry) =>
              total +
              ('costInCents' in entry
                ? entry.costInCents
                : entry.totalCostInCents),
            0,
          )
      : 0
  const currentYear = currentDate.getFullYear()
  const elapsedMonthCount =
    year < currentYear
      ? 12
      : year === currentYear
        ? currentDate.getMonth() + 1
        : 0

  return {
    totalCostInCents,
    fuelCostInCents,
    serviceCostInCents,
    averageMonthlyCostInCents:
      elapsedMonthCount > 0 ? totalCostInCents / elapsedMonthCount : null,
    costPerDistanceUnitInCents:
      recordedDistance && recordedDistance > 0
        ? distancePeriodCostInCents / recordedDistance
        : null,
    recordedDistance,
    distancePeriodStart: recordedDistance ? (firstReading?.date ?? null) : null,
    distancePeriodEnd: recordedDistance ? (lastReading?.date ?? null) : null,
    monthlyCosts,
  }
}

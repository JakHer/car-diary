import type { OdometerReading, OdometerReadingSource } from '@/types'

const sourcePriority: Record<OdometerReadingSource, number> = {
  vehicle: 0,
  snapshot: 1,
  manual: 2,
  fuel: 3,
  service: 3,
}

export const normalizeOdometerReadings = (
  readings: OdometerReading[],
): OdometerReading[] => {
  const readingsByDate = new Map<string, OdometerReading>()

  for (const reading of readings) {
    const existingReading = readingsByDate.get(reading.date)
    if (
      !existingReading ||
      reading.mileage > existingReading.mileage ||
      (reading.mileage === existingReading.mileage &&
        sourcePriority[reading.source] > sourcePriority[existingReading.source])
    ) {
      readingsByDate.set(reading.date, reading)
    }
  }

  const sortedReadings = [...readingsByDate.values()].toSorted(
    (first, second) => first.date.localeCompare(second.date),
  )
  const normalizedReadings: OdometerReading[] = []
  let highestRecordedMileage = -1

  for (const reading of sortedReadings) {
    const isDerivedReading =
      reading.source === 'vehicle' || reading.source === 'snapshot'
    if (isDerivedReading && reading.mileage <= highestRecordedMileage) continue

    normalizedReadings.push(reading)
    highestRecordedMileage = Math.max(
      highestRecordedMileage,
      reading.mileage,
    )
  }

  return normalizedReadings
}

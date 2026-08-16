import type { DistanceUnit } from '../types'

const mileRegions = new Set(['GB', 'US'])

export const isDistanceUnit = (value: unknown): value is DistanceUnit =>
  value === 'km' || value === 'mi'

export const getBrowserDistanceUnit = (
  locale = typeof navigator === 'undefined' ? 'en-GB' : navigator.language,
): DistanceUnit => {
  try {
    const region = new Intl.Locale(locale).maximize().region
    return region && mileRegions.has(region) ? 'mi' : 'km'
  } catch {
    return 'km'
  }
}

export const formatDistance = (
  value: number,
  unit: DistanceUnit,
  locale: string,
): string =>
  new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: unit === 'km' ? 'kilometer' : 'mile',
    unitDisplay: 'short',
    maximumFractionDigits: 0,
  }).format(value)

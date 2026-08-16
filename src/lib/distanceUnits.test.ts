import { describe, expect, it } from 'vitest'
import {
  formatDistance,
  getBrowserDistanceUnit,
  isDistanceUnit,
} from './distanceUnits'

describe('distance units', () => {
  it.each([
    ['pl-PL', 'km'],
    ['en-US', 'mi'],
    ['en-GB', 'mi'],
    ['en-CA', 'km'],
  ] as const)('suggests %s as %s', (locale, unit) => {
    expect(getBrowserDistanceUnit(locale)).toBe(unit)
  })

  it('formats values using the selected unit', () => {
    expect(formatDistance(86_200, 'km', 'en-US')).toBe('86,200 km')
    expect(formatDistance(53_562, 'mi', 'en-US')).toBe('53,562 mi')
  })

  it('accepts only supported units', () => {
    expect(isDistanceUnit('km')).toBe(true)
    expect(isDistanceUnit('mi')).toBe(true)
    expect(isDistanceUnit('miles')).toBe(false)
  })
})

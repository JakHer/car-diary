import { describe, expect, it } from 'vitest'
import { getLocalDate } from './local-date'

describe('getLocalDate', () => {
  it('formats local calendar values as an ISO date', () => {
    expect(getLocalDate(new Date(2026, 0, 2, 23, 45))).toBe('2026-01-02')
  })

  it('pads single-digit months and days', () => {
    expect(getLocalDate(new Date(2026, 8, 7))).toBe('2026-09-07')
  })
})

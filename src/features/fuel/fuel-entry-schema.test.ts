import { describe, expect, it } from 'vitest'
import { fuelEntrySchema } from './fuel-entry-schema'

describe('fuel entry schema', () => {
  it('requires positive fuel volume and cost', () => {
    const validEntry = {
      date: '2026-08-16',
      mileage: 86_200,
      liters: 42.75,
      totalCost: 275,
      station: '',
      fullTank: true,
    }

    expect(fuelEntrySchema.safeParse(validEntry).success).toBe(true)
    expect(
      fuelEntrySchema.safeParse({ ...validEntry, liters: 0 }).success,
    ).toBe(false)
    expect(
      fuelEntrySchema.safeParse({ ...validEntry, totalCost: 0 }).success,
    ).toBe(false)
  })
})

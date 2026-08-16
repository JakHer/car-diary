import { describe, expect, it } from 'vitest'
import {
  authSchema,
  createMileageSchema,
  fuelEntrySchema,
  maintenanceReminderSchema,
  serviceRecordSchema,
  vehicleSchema,
} from './validation'

describe('validation schemas', () => {
  it('normalizes valid vehicle data', () => {
    expect(
      vehicleSchema.parse({
        make: '  Volvo ',
        model: ' V60 ',
        year: 2021,
        currentMileage: 86_200,
        distanceUnit: 'km',
        registrationNumber: ' WA 12345 ',
        vin: 'yv1zwbmv1m1234567',
      }),
    ).toEqual({
      make: 'Volvo',
      model: 'V60',
      year: 2021,
      currentMileage: 86_200,
      distanceUnit: 'km',
      registrationNumber: 'WA 12345',
      vin: 'YV1ZWBMV1M1234567',
    })
  })

  it('rejects invalid auth and service values', () => {
    expect(
      authSchema.safeParse({ email: 'not-an-email', password: '123' }).success,
    ).toBe(false)
    expect(
      serviceRecordSchema.safeParse({
        title: '',
        category: 'Maintenance',
        date: 'not-a-date',
        mileage: -1,
        cost: -1,
        workshop: '',
        notes: '',
      }).success,
    ).toBe(false)
  })

  it('requires at least one reminder target', () => {
    expect(
      maintenanceReminderSchema.safeParse({
        title: 'Oil change',
        dueDate: '',
        dueMileage: null,
      }).success,
    ).toBe(false)
    expect(
      maintenanceReminderSchema.safeParse({
        title: 'Oil change',
        dueDate: '',
        dueMileage: 100_000,
      }).success,
    ).toBe(true)
  })

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

  it('does not allow the odometer to move backwards', () => {
    const schema = createMileageSchema(86_200)

    expect(schema.safeParse({ currentMileage: 86_199 }).success).toBe(false)
    expect(schema.safeParse({ currentMileage: 90_000 }).success).toBe(true)
  })

  it('uses the vehicle unit in mileage validation messages', () => {
    const result = createMileageSchema(50_000, 'mi').safeParse({
      currentMileage: 49_999,
    })

    expect(result.error?.issues[0]?.message).toContain('50,000 mi')
  })
})

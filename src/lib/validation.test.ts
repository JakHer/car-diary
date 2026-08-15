import { describe, expect, it } from 'vitest'
import {
  authSchema,
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
        registrationNumber: ' WA 12345 ',
        vin: 'yv1zwbmv1m1234567',
      }),
    ).toEqual({
      make: 'Volvo',
      model: 'V60',
      year: 2021,
      currentMileage: 86_200,
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
})

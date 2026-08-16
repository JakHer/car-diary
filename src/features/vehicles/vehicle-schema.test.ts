import { describe, expect, it } from 'vitest'
import { createMileageSchema, vehicleSchema } from './vehicle-schema'

describe('vehicle schemas', () => {
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

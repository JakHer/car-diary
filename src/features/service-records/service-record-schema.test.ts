import { describe, expect, it } from 'vitest'
import { serviceRecordSchema } from './service-record-schema'

describe('service record schema', () => {
  it('rejects invalid service values', () => {
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
})

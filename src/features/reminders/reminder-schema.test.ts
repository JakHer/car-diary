import { describe, expect, it } from 'vitest'
import { maintenanceReminderSchema } from './reminder-schema'

describe('maintenance reminder schema', () => {
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

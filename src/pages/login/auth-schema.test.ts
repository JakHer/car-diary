import { describe, expect, it } from 'vitest'
import { authSchema } from './auth-schema'

describe('auth schema', () => {
  it('rejects an invalid email and a short password', () => {
    expect(
      authSchema.safeParse({ email: 'not-an-email', password: '123' }).success,
    ).toBe(false)
  })
})

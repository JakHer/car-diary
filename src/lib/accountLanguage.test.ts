import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { getAccountLanguage } from './accountLanguage'

const createUser = (preferredLanguage: unknown) =>
  ({
    id: 'user-1',
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2026-08-16T00:00:00Z',
    user_metadata: { preferred_language: preferredLanguage },
  }) satisfies User

describe('getAccountLanguage', () => {
  it('accepts only supported account languages', () => {
    expect(getAccountLanguage(createUser('pl'))).toBe('pl')
    expect(getAccountLanguage(createUser('en'))).toBe('en')
    expect(getAccountLanguage(createUser('de'))).toBeNull()
  })
})

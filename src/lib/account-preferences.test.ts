import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import {
  getAccountDistanceUnit,
  getAccountLanguage,
} from './account-preferences'

const createUser = (language: unknown, distanceUnit: unknown) =>
  ({
    id: 'user-1',
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2026-08-16T00:00:00Z',
    user_metadata: {
      preferred_distance_unit: distanceUnit,
      preferred_language: language,
    },
  }) satisfies User

describe('account preferences', () => {
  it('accepts only supported values', () => {
    expect(getAccountLanguage(createUser('pl', 'mi'))).toBe('pl')
    expect(getAccountDistanceUnit(createUser('pl', 'mi'))).toBe('mi')
    expect(getAccountLanguage(createUser('de', 'yards'))).toBeNull()
    expect(getAccountDistanceUnit(createUser('de', 'yards'))).toBeNull()
  })
})

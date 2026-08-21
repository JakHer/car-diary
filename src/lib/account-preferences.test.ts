import type { User } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import {
  getAccountActiveVehicleId,
  getAccountDistanceUnit,
  getAccountLanguage,
} from './account-preferences'

const createUser = (
  language: unknown,
  distanceUnit: unknown,
  activeVehicleId: unknown = undefined,
) =>
  ({
    id: 'user-1',
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2026-08-16T00:00:00Z',
    user_metadata: {
      active_vehicle_id: activeVehicleId,
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
    expect(
      getAccountActiveVehicleId(createUser('pl', 'km', 'vehicle-1')),
    ).toBe('vehicle-1')
    expect(
      getAccountActiveVehicleId(createUser('pl', 'km', 123)),
    ).toBeNull()
  })
})

import type { User } from '@supabase/supabase-js'
import type { AppLanguage } from '../i18n'
import type { DistanceUnit } from '../types'
import { isDistanceUnit } from './distanceUnits'
import { getSupabaseClient } from './supabase'

interface AccountPreferencesUpdate {
  preferred_distance_unit?: DistanceUnit
  preferred_language?: AppLanguage
}

export const isAppLanguage = (value: unknown): value is AppLanguage =>
  value === 'en' || value === 'pl'

export const getAccountLanguage = (user: User): AppLanguage | null => {
  const language = user.user_metadata.preferred_language
  return isAppLanguage(language) ? language : null
}

export const getAccountDistanceUnit = (user: User): DistanceUnit | null => {
  const unit = user.user_metadata.preferred_distance_unit
  return isDistanceUnit(unit) ? unit : null
}

export const saveAccountPreferences = async (
  preferences: AccountPreferencesUpdate,
) => {
  const { error } = await getSupabaseClient().auth.updateUser({
    data: preferences,
  })

  if (error) throw error
}

export const saveAccountLanguage = (language: AppLanguage) =>
  saveAccountPreferences({ preferred_language: language })

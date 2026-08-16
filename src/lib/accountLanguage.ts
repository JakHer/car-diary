import type { User } from '@supabase/supabase-js'
import type { AppLanguage } from '../i18n'
import { getSupabaseClient } from './supabase'

const isAppLanguage = (value: unknown): value is AppLanguage =>
  value === 'en' || value === 'pl'

export const getAccountLanguage = (user: User): AppLanguage | null => {
  const language = user.user_metadata.preferred_language
  return isAppLanguage(language) ? language : null
}

export const saveAccountLanguage = async (language: AppLanguage) => {
  const { error } = await getSupabaseClient().auth.updateUser({
    data: { preferred_language: language },
  })

  if (error) throw error
}

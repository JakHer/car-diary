import { useLayoutEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { changeAppLanguage, getAppLanguage } from '../i18n'
import {
  getAccountDistanceUnit,
  getAccountLanguage,
  saveAccountPreferences,
} from '../lib/accountPreferences'
import { getBrowserDistanceUnit } from '../lib/distanceUnits'

export const useAccountPreferences = (user: User | undefined) => {
  const seededUserId = useRef<string | null>(null)
  const accountLanguage = user ? getAccountLanguage(user) : null
  const accountDistanceUnit = user ? getAccountDistanceUnit(user) : null
  const browserDistanceUnit = getBrowserDistanceUnit()

  useLayoutEffect(() => {
    if (!user) {
      seededUserId.current = null
      return
    }

    if (accountLanguage && accountLanguage !== getAppLanguage()) {
      void changeAppLanguage(accountLanguage)
    }

    const missingPreferences = {
      ...(!accountLanguage && { preferred_language: getAppLanguage() }),
      ...(!accountDistanceUnit && {
        preferred_distance_unit: browserDistanceUnit,
      }),
    }

    if (Object.keys(missingPreferences).length === 0) {
      seededUserId.current = null
      return
    }

    if (seededUserId.current === user.id) return
    seededUserId.current = user.id
    void saveAccountPreferences(missingPreferences).catch(() => {
      seededUserId.current = null
    })
  }, [accountDistanceUnit, accountLanguage, browserDistanceUnit, user])

  return accountDistanceUnit ?? browserDistanceUnit
}

import { useLayoutEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  changeAppLanguage,
  getAppLanguage,
} from '../i18n'
import {
  getAccountLanguage,
  saveAccountLanguage,
} from '../lib/accountLanguage'

export const useAccountLanguage = (user: User | undefined) => {
  const seededUserId = useRef<string | null>(null)
  const accountLanguage = user ? getAccountLanguage(user) : null

  useLayoutEffect(() => {
    if (!user) {
      seededUserId.current = null
      return
    }

    if (accountLanguage) {
      seededUserId.current = null
      if (accountLanguage !== getAppLanguage()) {
        void changeAppLanguage(accountLanguage)
      }
      return
    }

    if (seededUserId.current === user.id) return
    seededUserId.current = user.id
    void saveAccountLanguage(getAppLanguage()).catch(() => {
      seededUserId.current = null
    })
  }, [accountLanguage, user])
}

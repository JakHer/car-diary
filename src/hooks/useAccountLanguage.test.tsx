import { render, waitFor } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import {
  getAccountLanguage,
  saveAccountLanguage,
} from '../lib/accountLanguage'
import { useAccountLanguage } from './useAccountLanguage'

vi.mock('../lib/accountLanguage', () => ({
  getAccountLanguage: vi.fn(),
  saveAccountLanguage: vi.fn(),
}))

const getAccountLanguageMock = vi.mocked(getAccountLanguage)
const saveAccountLanguageMock = vi.mocked(saveAccountLanguage)
const user = { id: 'user-1', user_metadata: {} } as User

const AccountLanguageProbe = () => {
  useAccountLanguage(user)
  return null
}

describe('useAccountLanguage', () => {
  beforeEach(async () => {
    getAccountLanguageMock.mockReset()
    saveAccountLanguageMock.mockReset()
    await i18n.changeLanguage('en')
  })

  it('applies the language saved on the account', async () => {
    getAccountLanguageMock.mockReturnValue('pl')

    render(<AccountLanguageProbe />)

    await waitFor(() => expect(i18n.resolvedLanguage).toBe('pl'))
  })

  it('stores the current language when the account has no preference', () => {
    getAccountLanguageMock.mockReturnValue(null)
    saveAccountLanguageMock.mockResolvedValue(undefined)

    render(<AccountLanguageProbe />)

    expect(saveAccountLanguageMock).toHaveBeenCalledWith('en')
  })
})

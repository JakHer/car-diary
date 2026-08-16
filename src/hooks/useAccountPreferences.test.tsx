import { render, waitFor } from '@testing-library/react'
import type { User } from '@supabase/supabase-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import {
  getAccountDistanceUnit,
  getAccountLanguage,
  saveAccountPreferences,
} from '../lib/accountPreferences'
import { useAccountPreferences } from './useAccountPreferences'

vi.mock('../lib/accountPreferences', () => ({
  getAccountDistanceUnit: vi.fn(),
  getAccountLanguage: vi.fn(),
  saveAccountPreferences: vi.fn(),
}))

vi.mock('../lib/distanceUnits', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/distanceUnits')>()),
  getBrowserDistanceUnit: () => 'km',
}))

const getAccountDistanceUnitMock = vi.mocked(getAccountDistanceUnit)
const getAccountLanguageMock = vi.mocked(getAccountLanguage)
const saveAccountPreferencesMock = vi.mocked(saveAccountPreferences)
const user = { id: 'user-1', user_metadata: {} } as User

const AccountPreferencesProbe = () => (
  <output>{useAccountPreferences(user)}</output>
)

describe('useAccountPreferences', () => {
  beforeEach(async () => {
    getAccountDistanceUnitMock.mockReset()
    getAccountLanguageMock.mockReset()
    saveAccountPreferencesMock.mockReset()
    await i18n.changeLanguage('en')
  })

  it('applies preferences saved on the account', async () => {
    getAccountLanguageMock.mockReturnValue('pl')
    getAccountDistanceUnitMock.mockReturnValue('mi')

    render(<AccountPreferencesProbe />)

    expect(document.querySelector('output')).toHaveTextContent('mi')
    await waitFor(() => expect(i18n.resolvedLanguage).toBe('pl'))
  })

  it('stores browser defaults when preferences are missing', () => {
    getAccountLanguageMock.mockReturnValue(null)
    getAccountDistanceUnitMock.mockReturnValue(null)
    saveAccountPreferencesMock.mockResolvedValue(undefined)

    render(<AccountPreferencesProbe />)

    expect(saveAccountPreferencesMock).toHaveBeenCalledWith({
      preferred_distance_unit: 'km',
      preferred_language: 'en',
    })
  })
})

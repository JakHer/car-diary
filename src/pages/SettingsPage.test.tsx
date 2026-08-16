import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { User } from '@supabase/supabase-js'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { saveAccountPreferences } from '../lib/accountPreferences'
import { SettingsPage } from './SettingsPage'

vi.mock('../lib/accountPreferences', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/accountPreferences')>()),
  saveAccountPreferences: vi.fn(),
}))

const saveAccountPreferencesMock = vi.mocked(saveAccountPreferences)
const user = {
  id: 'user-1',
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2026-08-16T00:00:00Z',
  email: 'driver@example.com',
  user_metadata: {
    preferred_distance_unit: 'km',
    preferred_language: 'en',
  },
} satisfies User

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/settings']}>
      <SettingsPage
        defaultDistanceUnit="km"
        user={user}
        userEmail="driver@example.com"
        onSignOut={vi.fn()}
      />
    </MemoryRouter>,
  )

describe('SettingsPage', () => {
  beforeEach(async () => {
    saveAccountPreferencesMock.mockReset()
    await i18n.changeLanguage('en')
  })

  it('saves account preferences', async () => {
    const userEventApi = userEvent.setup()
    saveAccountPreferencesMock.mockResolvedValue(undefined)
    renderPage()

    await userEventApi.click(
      screen.getByRole('combobox', { name: 'Default distance unit' }),
    )
    await userEventApi.click(screen.getByRole('option', { name: 'Miles (mi)' }))
    await userEventApi.click(
      screen.getByRole('button', { name: 'Save changes' }),
    )

    await waitFor(() =>
      expect(saveAccountPreferencesMock).toHaveBeenCalledWith({
        preferred_distance_unit: 'mi',
        preferred_language: 'en',
      }),
    )
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Settings saved.',
    )
  })

  it('shows a save error', async () => {
    const userEventApi = userEvent.setup()
    saveAccountPreferencesMock.mockRejectedValue(new Error('Save failed'))
    renderPage()

    await userEventApi.click(
      screen.getByRole('button', { name: 'Save changes' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not save your settings. Please try again.',
    )
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { saveAccountLanguage } from '../lib/accountPreferences'
import i18n, { resolveInitialLanguage } from '.'

vi.mock('../lib/accountPreferences', () => ({
  saveAccountLanguage: vi.fn(),
}))

const saveAccountLanguageMock = vi.mocked(saveAccountLanguage)

describe('internationalization', () => {
  beforeEach(() => {
    saveAccountLanguageMock.mockReset()
  })

  it('uses Polish for Polish browsers unless a saved choice exists', () => {
    expect(resolveInitialLanguage(null, 'pl-PL')).toBe('pl')
    expect(resolveInitialLanguage(null, 'en-US')).toBe('en')
    expect(resolveInitialLanguage('en', 'pl-PL')).toBe('en')
  })

  it('changes and remembers the selected language', async () => {
    const user = userEvent.setup()
    await i18n.changeLanguage('en')
    window.localStorage.removeItem('car-diary-language')

    render(<LanguageSwitcher />)
    await user.click(screen.getByRole('button', { name: 'Polish' }))

    expect(document.documentElement.lang).toBe('pl')
    expect(window.localStorage.getItem('car-diary-language')).toBe('pl')

    await user.click(screen.getByRole('button', { name: 'Angielski' }))
    window.localStorage.removeItem('car-diary-language')
  })

  it('saves the language for an authenticated account', async () => {
    const user = userEvent.setup()
    await i18n.changeLanguage('en')
    saveAccountLanguageMock.mockResolvedValue(undefined)

    render(<LanguageSwitcher syncWithAccount />)
    await user.click(screen.getByRole('button', { name: 'Polish' }))

    expect(saveAccountLanguageMock).toHaveBeenCalledWith('pl')

    await i18n.changeLanguage('en')
    window.localStorage.removeItem('car-diary-language')
  })
})

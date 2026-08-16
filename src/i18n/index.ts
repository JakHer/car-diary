import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en, pl } from './resources'

export type AppLanguage = 'en' | 'pl'

const languageStorageKey = 'car-diary-language'

const isAppLanguage = (value: string | null): value is AppLanguage =>
  value === 'en' || value === 'pl'

const getStoredLanguage = (): AppLanguage | null => {
  if (typeof window === 'undefined') return null

  try {
    const language = window.localStorage.getItem(languageStorageKey)
    return isAppLanguage(language) ? language : null
  } catch {
    return null
  }
}

const getBrowserLanguage = (): string => {
  if (typeof navigator === 'undefined') return 'en'

  return navigator.languages?.[0] ?? navigator.language
}

export const resolveInitialLanguage = (
  storedLanguage: string | null,
  browserLanguage: string,
): AppLanguage => {
  if (isAppLanguage(storedLanguage)) return storedLanguage
  return browserLanguage.toLowerCase().startsWith('pl') ? 'pl' : 'en'
}

const initialLanguage = resolveInitialLanguage(
  getStoredLanguage(),
  getBrowserLanguage(),
)

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pl: { translation: pl },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: ['en', 'pl'],
  load: 'languageOnly',
  initAsync: false,
  interpolation: { escapeValue: false },
})

const updateDocumentLanguage = (language: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language.startsWith('pl') ? 'pl' : 'en'
  }
}

updateDocumentLanguage(initialLanguage)
i18n.on('languageChanged', updateDocumentLanguage)

export const getIntlLocale = (language = i18n.resolvedLanguage): string =>
  language?.startsWith('pl') ? 'pl-PL' : 'en-GB'

export const getAppLanguage = (): AppLanguage =>
  i18n.resolvedLanguage?.startsWith('pl') ? 'pl' : 'en'

export const changeAppLanguage = async (language: AppLanguage) => {
  await i18n.changeLanguage(language)

  try {
    window.localStorage.setItem(languageStorageKey, language)
  } catch {
    // Language still changes for the current session if storage is unavailable.
  }
}

export default i18n

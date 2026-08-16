import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { changeAppLanguage, type AppLanguage } from '../i18n'
import { saveAccountLanguage } from '../lib/accountPreferences'
import { joinClassNames } from '../styles'

interface LanguageSwitcherProps {
  className?: string
  syncWithAccount?: boolean
}

const languages: AppLanguage[] = ['pl', 'en']

export const LanguageSwitcher = ({
  className,
  syncWithAccount = false,
}: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation()
  const [isSaving, setIsSaving] = useState(false)
  const [hasSaveError, setHasSaveError] = useState(false)
  const activeLanguage: AppLanguage = i18n.resolvedLanguage?.startsWith('pl')
    ? 'pl'
    : 'en'

  const selectLanguage = async (language: AppLanguage) => {
    if (language === activeLanguage || isSaving) return

    const previousLanguage = activeLanguage
    setHasSaveError(false)
    await changeAppLanguage(language)

    if (!syncWithAccount) return

    setIsSaving(true)
    try {
      await saveAccountLanguage(language)
    } catch {
      await changeAppLanguage(previousLanguage)
      setHasSaveError(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={joinClassNames('relative', className)}>
      <div
        className="inline-flex rounded-[9px] border border-border bg-surface p-0.5 shadow-sm"
        role="group"
        aria-busy={isSaving}
        aria-label={t('common.language')}
      >
        {languages.map((language) => (
          <button
            className={joinClassNames(
              'h-7 min-w-8 cursor-pointer rounded-[7px] border-0 px-2 text-[11px] font-extrabold tracking-[0.04em] uppercase transition-colors disabled:cursor-wait disabled:opacity-65',
              activeLanguage === language
                ? 'bg-accent text-white'
                : 'bg-transparent text-muted hover:bg-surface-muted hover:text-strong',
            )}
            key={language}
            type="button"
            aria-label={
              language === 'pl' ? t('common.polish') : t('common.english')
            }
            aria-pressed={activeLanguage === language}
            disabled={isSaving}
            onClick={() => void selectLanguage(language)}
          >
            {language}
          </button>
        ))}
      </div>
      {hasSaveError && (
        <span
          className="absolute top-full right-0 z-20 mt-2 w-max max-w-56 rounded-lg bg-[#fff2f2] px-3 py-2 text-xs font-semibold text-[#852424] shadow-card"
          role="alert"
        >
          {t('common.languageSaveError')}
        </span>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { changeAppLanguage, type AppLanguage } from '@/i18n'
import { saveAccountLanguage } from '@/lib/account-preferences'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
    <div className={cn('relative', className)}>
      <div
        className="inline-flex rounded-[9px] border border-border bg-surface p-0.5 shadow-sm"
        role="group"
        aria-busy={isSaving}
        aria-label={t('common.language')}
      >
        {languages.map((language) => (
          <Button
            className="h-7 min-w-8 rounded-[7px] px-2 text-[11px] font-extrabold tracking-[0.04em] uppercase"
            variant={activeLanguage === language ? 'default' : 'ghost'}
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
          </Button>
        ))}
      </div>
      {hasSaveError && (
        <span
          className="absolute top-full right-0 z-20 mt-2 w-max max-w-56 rounded-lg bg-danger-soft px-3 py-2 text-xs font-semibold text-danger shadow-card"
          role="alert"
        >
          {t('common.languageSaveError')}
        </span>
      )}
    </div>
  )
}

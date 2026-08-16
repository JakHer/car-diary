import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { User } from '@supabase/supabase-js'
import { AppHeader } from '@/components/layout/app-header'
import { PageHeader } from '@/components/layout/page-header'
import { PageLayout } from '@/components/layout/page-layout'
import { Loader } from '@/components/feedback/loader'
import { SelectField } from '@/components/forms/select-field'
import {
  changeAppLanguage,
  getAppLanguage,
  type AppLanguage,
} from '@/i18n'
import {
  getAccountDistanceUnit,
  getAccountLanguage,
  isAppLanguage,
  saveAccountPreferences,
} from '@/lib/account-preferences'
import { isDistanceUnit } from '@/lib/distance-units'
import type { DistanceUnit } from '@/types'
import { Button } from '@/components/ui/button'

interface SettingsPageProps {
  defaultDistanceUnit: DistanceUnit
  user: User
  userEmail: string
  onSignOut: () => Promise<void>
}

export const SettingsPage = ({
  defaultDistanceUnit,
  user,
  userEmail,
  onSignOut,
}: SettingsPageProps) => {
  const { t } = useTranslation()
  const [language, setLanguage] = useState<AppLanguage>(
    getAccountLanguage(user) ?? getAppLanguage(),
  )
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(
    getAccountDistanceUnit(user) ?? defaultDistanceUnit,
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'error' | 'saved' | null>(null)

  useEffect(() => {
    setLanguage(getAccountLanguage(user) ?? getAppLanguage())
    setDistanceUnit(
      getAccountDistanceUnit(user) ?? defaultDistanceUnit,
    )
  }, [defaultDistanceUnit, user])

  const savePreferences = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setSaveStatus(null)

    try {
      await saveAccountPreferences({
        preferred_distance_unit: distanceUnit,
        preferred_language: language,
      })
      await changeAppLanguage(language)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-[calc(100%_-_40px)] max-w-[1180px] flex-col max-[700px]:w-[calc(100%_-_28px)]">
      <AppHeader userEmail={userEmail} onSignOut={onSignOut} />

      <PageLayout className="mx-auto w-full max-w-[760px] max-[700px]:py-10">
        <PageHeader
          description={t('settings.description')}
          eyebrow={t('settings.eyebrow')}
          title={t('settings.title')}
        />

        <form
          className="mt-9 overflow-hidden rounded-large border border-border bg-surface shadow-card"
          aria-busy={isSaving}
          onSubmit={savePreferences}
        >
          <section className="grid grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)] items-center gap-8 border-b border-border p-7 max-[700px]:grid-cols-1 max-[700px]:gap-4 max-[700px]:p-[22px]">
            <div>
              <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-strong">
                {t('settings.language')}
              </h2>
              <p className="mt-1.5 mb-0 text-[13px] leading-[1.55] text-muted">
                {t('settings.languageDescription')}
              </p>
            </div>
            <SelectField
              ariaLabel={t('settings.language')}
              disabled={isSaving}
              options={[
                { label: t('common.polish'), value: 'pl' },
                { label: t('common.english'), value: 'en' },
              ]}
              value={language}
              onValueChange={(value) => {
                if (isAppLanguage(value)) setLanguage(value)
              }}
            />
          </section>

          <section className="grid grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)] items-center gap-8 border-b border-border p-7 max-[700px]:grid-cols-1 max-[700px]:gap-4 max-[700px]:p-[22px]">
            <div>
              <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-strong">
                {t('settings.distanceUnit')}
              </h2>
              <p className="mt-1.5 mb-0 text-[13px] leading-[1.55] text-muted">
                {t('settings.distanceUnitDescription')}
              </p>
            </div>
            <SelectField
              ariaLabel={t('settings.distanceUnit')}
              disabled={isSaving}
              options={[
                { label: t('vehicle.kilometers'), value: 'km' },
                { label: t('vehicle.miles'), value: 'mi' },
              ]}
              value={distanceUnit}
              onValueChange={(value) => {
                if (isDistanceUnit(value)) setDistanceUnit(value)
              }}
            />
          </section>

          <section className="p-7 max-[700px]:p-[22px]">
            <h2 className="m-0 text-lg font-bold tracking-[-0.02em] text-strong">
              {t('settings.account')}
            </h2>
            <span className="mt-1.5 block text-sm text-muted">{userEmail}</span>
          </section>

          <div className="flex min-h-[94px] items-center justify-between gap-5 border-t border-border bg-surface-muted/40 px-7 py-5 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:px-[22px]">
            <div className="min-h-[20px] text-[13px] font-semibold">
              {saveStatus === 'saved' && (
                <span className="text-accent" role="status">
                  {t('settings.saved')}
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-danger" role="alert">
                  {t('settings.saveError')}
                </span>
              )}
            </div>
            <Button
              className="shrink-0 max-[700px]:w-full"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader label={t('settings.saving')} size="small" />
              ) : (
                t('settings.save')
              )}
            </Button>
          </div>
        </form>
      </PageLayout>
    </div>
  )
}

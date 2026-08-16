import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { getSupabaseClient } from '@/lib/supabase'
import { createAuthSchema, type AuthFormValues } from './auth-schema'
import { useTranslatedFormErrors } from '@/hooks/use-translated-form-errors'
import { FieldError } from '@/components/forms/field-error'
import { Loader } from '@/components/feedback/loader'
import { LanguageSwitcher } from '@/features/preferences/language-switcher'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

type AuthMode = 'sign-in' | 'sign-up'

export const AuthScreen = () => {
  const { i18n, t } = useTranslation()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const schema = useMemo(
    () => createAuthSchema(t),
    [t],
  )
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    trigger,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)

  const switchMode = () => {
    setMode((currentMode) =>
      currentMode === 'sign-in' ? 'sign-up' : 'sign-in',
    )
    clearErrors()
    setError(null)
    setNotice(null)
  }

  const submitAuth = async ({ email, password }: AuthFormValues) => {
    const client = getSupabaseClient()

    setError(null)
    setNotice(null)

    try {
      if (mode === 'sign-in') {
        const { error: signInError } = await client.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
      } else {
        const { data: signUpData, error: signUpError } =
          await client.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          })

        if (signUpError) throw signUpError
        if (!signUpData.session) {
          setNotice(t('auth.confirmationNotice'))
        }
      }
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : t('auth.failed'),
      )
    }
  }

  return (
    <main className="relative grid min-h-svh grid-cols-[minmax(0,1.15fr)_minmax(430px,0.85fr)] bg-surface max-[900px]:grid-cols-1">
      <div className="absolute top-6 right-6 z-10 max-[700px]:top-5 max-[700px]:right-5">
        <LanguageSwitcher />
      </div>
      <section className="flex flex-col justify-between gap-20 bg-[#123d2c] bg-[radial-gradient(circle_at_85%_15%,rgba(77,177,127,0.28),transparent_32%)] p-[clamp(36px,6vw,80px)] text-[#dce9e2] max-[900px]:min-h-[430px] max-[900px]:gap-[70px] max-[700px]:min-h-[390px] max-[700px]:p-7">
        <Link
          className="inline-flex items-center gap-3 font-[750] text-white no-underline"
          to="/"
          aria-label={t('common.homeAria')}
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white text-xs tracking-[0.06em] text-accent" aria-hidden="true">
            CD
          </span>
          <span>{t('common.appName')}</span>
        </Link>
        <div>
          <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-[#77d5a7] uppercase">
            {t('auth.eyebrow')}
          </p>
          <h1 className="m-0 max-w-[760px] text-[clamp(50px,6vw,78px)] leading-[1.02] font-bold tracking-[-0.055em] text-white max-[900px]:text-[clamp(42px,9vw,64px)]">
            {t('auth.heroTitle')}
          </h1>
          <p className="mt-[26px] mb-0 max-w-[580px] text-lg leading-[1.65] max-[700px]:text-base">
            {t('auth.heroDescription')}
          </p>
        </div>
      </section>

      <section
        className="m-auto w-full max-w-[520px] p-12 max-[900px]:py-16 max-[700px]:px-6 max-[700px]:py-12"
        aria-labelledby="auth-title"
      >
        <div>
          <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
            {mode === 'sign-in'
              ? t('auth.welcomeBack')
              : t('auth.createAccount')}
          </p>
          <h2
            className="m-0 text-[30px] font-bold tracking-[-0.04em] text-strong"
            id="auth-title"
          >
            {mode === 'sign-in'
              ? t('auth.signInTitle')
              : t('auth.signUpTitle')}
          </h2>
          <p className="mt-2.5 mb-0 text-sm leading-[1.55] text-muted">
            {mode === 'sign-in'
              ? t('auth.signInDescription')
              : t('auth.signUpDescription')}
          </p>
        </div>

        <form
          className="mt-8 grid gap-5"
          noValidate
          onSubmit={handleSubmit(submitAuth)}
        >
          <Field>
            <span>{t('auth.email')}</span>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              autoFocus
              aria-label={t('auth.email')}
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </Field>

          <Field>
            <span>{t('auth.password')}</span>
            <Input
              type="password"
              autoComplete={
                mode === 'sign-in' ? 'current-password' : 'new-password'
              }
              placeholder={t('auth.passwordPlaceholder')}
              aria-label={t('auth.password')}
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </Field>

          {error && <p className="m-0 rounded-[9px] bg-danger-soft px-3 py-[11px] text-[13px] leading-[1.45] text-danger">{error}</p>}
          {notice && (
            <p className="m-0 rounded-[9px] bg-accent-soft px-3 py-[11px] text-[13px] leading-[1.45] text-[#145c3c]">
              {notice}
            </p>
          )}

          <Button
            className="w-full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader
                label={
                  mode === 'sign-in'
                    ? t('auth.signingIn')
                    : t('auth.creatingAccount')
                }
                size="small"
              />
            ) : mode === 'sign-in' ? (
              t('auth.signIn')
            ) : (
              t('auth.createAccount')
            )}
          </Button>
        </form>

        <p className="mt-6 mb-0 text-center text-[13px] text-muted">
          {mode === 'sign-in'
            ? t('auth.noAccount')
            : t('auth.existingAccount')}{' '}
          <Button
            className="h-auto p-0 text-[13px]"
            variant="link"
            type="button"
            onClick={switchMode}
          >
            {mode === 'sign-in' ? t('auth.createOne') : t('auth.signIn')}
          </Button>
        </p>
      </section>
    </main>
  )
}

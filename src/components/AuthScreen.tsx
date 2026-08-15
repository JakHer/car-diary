import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSupabaseClient } from '../lib/supabase'
import { authSchema, type AuthFormValues } from '../lib/validation'
import { FieldError } from './FieldError'
import { Loader } from './Loader'
import {
  brandStyles,
  eyebrowStyles,
  fieldStyles,
  formErrorStyles,
  inputStyles,
  invalidControlStyles,
  joinClassNames,
  primaryButtonStyles,
  inverseBrandMarkStyles,
} from '../styles'

type AuthMode = 'sign-in' | 'sign-up'

export const AuthScreen = () => {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  })

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
          setNotice('Check your inbox to confirm your email, then sign in.')
        }
      }
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : 'Authentication failed. Please try again.',
      )
    }
  }

  return (
    <main className="grid min-h-svh grid-cols-[minmax(0,1.15fr)_minmax(430px,0.85fr)] bg-surface max-[900px]:grid-cols-1">
      <section className="flex flex-col justify-between gap-20 bg-[#123d2c] bg-[radial-gradient(circle_at_85%_15%,rgba(77,177,127,0.28),transparent_32%)] p-[clamp(36px,6vw,80px)] text-[#dce9e2] max-[900px]:min-h-[430px] max-[900px]:gap-[70px] max-[700px]:min-h-[390px] max-[700px]:p-7">
        <a
          className={joinClassNames(brandStyles, 'text-white')}
          href="/"
          aria-label="Car Diary home page"
        >
          <span className={inverseBrandMarkStyles} aria-hidden="true">
            CD
          </span>
          <span>Car Diary</span>
        </a>
        <div>
          <p className={joinClassNames(eyebrowStyles, 'text-[#77d5a7]')}>
            Your complete vehicle history
          </p>
          <h1 className="m-0 max-w-[760px] text-[clamp(50px,6vw,78px)] leading-[1.02] font-bold tracking-[-0.055em] text-white max-[900px]:text-[clamp(42px,9vw,64px)]">
            Every service record, available wherever you are.
          </h1>
          <p className="mt-[26px] mb-0 max-w-[580px] text-lg leading-[1.65] max-[700px]:text-base">
            Sign in to keep your vehicles, maintenance history, and expenses
            securely synced.
          </p>
        </div>
      </section>

      <section
        className="m-auto w-full max-w-[520px] p-12 max-[900px]:py-16 max-[700px]:px-6 max-[700px]:py-12"
        aria-labelledby="auth-title"
      >
        <div>
          <p className={eyebrowStyles}>
            {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
          </p>
          <h2
            className="m-0 text-[30px] font-bold tracking-[-0.04em] text-strong"
            id="auth-title"
          >
            {mode === 'sign-in' ? 'Sign in to Car Diary' : 'Start your diary'}
          </h2>
          <p className="mt-2.5 mb-0 text-sm leading-[1.55] text-muted">
            {mode === 'sign-in'
              ? 'Enter the details connected to your account.'
              : 'Use your email and a password with at least 6 characters.'}
          </p>
        </div>

        <form
          className="mt-8 grid gap-5"
          noValidate
          onSubmit={handleSubmit(submitAuth)}
        >
          <label className={fieldStyles}>
            <span>Email</span>
            <input
              className={joinClassNames(
                inputStyles,
                errors.email && invalidControlStyles,
              )}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              autoFocus
              aria-label="Email"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </label>

          <label className={fieldStyles}>
            <span>Password</span>
            <input
              className={joinClassNames(
                inputStyles,
                errors.password && invalidControlStyles,
              )}
              type="password"
              autoComplete={
                mode === 'sign-in' ? 'current-password' : 'new-password'
              }
              placeholder="At least 6 characters"
              aria-label="Password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
          </label>

          {error && <p className={formErrorStyles}>{error}</p>}
          {notice && (
            <p className="m-0 rounded-[9px] bg-accent-soft px-3 py-[11px] text-[13px] leading-[1.45] text-[#145c3c]">
              {notice}
            </p>
          )}

          <button
            className={joinClassNames(primaryButtonStyles, 'w-full')}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader
                label={
                  mode === 'sign-in' ? 'Signing in...' : 'Creating account...'
                }
                size="small"
              />
            ) : mode === 'sign-in' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-6 mb-0 text-center text-[13px] text-muted">
          {mode === 'sign-in'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            className="cursor-pointer border-0 bg-transparent p-0 font-[750] text-accent hover:underline focus-visible:underline"
            type="button"
            onClick={switchMode}
          >
            {mode === 'sign-in' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </section>
    </main>
  )
}

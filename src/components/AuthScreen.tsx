import { useState } from 'react'
import type { FormEvent } from 'react'
import { getSupabaseClient } from '../lib/supabase'
import {
  brandStyles,
  eyebrowStyles,
  fieldStyles,
  formErrorStyles,
  inputStyles,
  joinClassNames,
  primaryButtonStyles,
  inverseBrandMarkStyles,
} from '../styles'

type AuthMode = 'sign-in' | 'sign-up'

export const AuthScreen = () => {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const switchMode = () => {
    setMode((currentMode) =>
      currentMode === 'sign-in' ? 'sign-up' : 'sign-in',
    )
    setError(null)
    setNotice(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email')).trim()
    const password = String(data.get('password'))
    const client = getSupabaseClient()

    setIsSubmitting(true)
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
    } finally {
      setIsSubmitting(false)
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

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className={fieldStyles}>
            <span>Email</span>
            <input
              className={inputStyles}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              autoFocus
            />
          </label>

          <label className={fieldStyles}>
            <span>Password</span>
            <input
              className={inputStyles}
              name="password"
              type="password"
              minLength={6}
              autoComplete={
                mode === 'sign-in' ? 'current-password' : 'new-password'
              }
              placeholder="At least 6 characters"
              required
            />
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
            {isSubmitting
              ? 'Please wait...'
              : mode === 'sign-in'
                ? 'Sign in'
                : 'Create account'}
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

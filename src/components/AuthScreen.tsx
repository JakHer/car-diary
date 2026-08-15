import { useState } from 'react'
import type { FormEvent } from 'react'
import { getSupabaseClient } from '../lib/supabase'

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
    <main className="auth-layout">
      <section className="auth-intro">
        <a className="brand" href="/" aria-label="Car Diary home page">
          <span className="brand-mark" aria-hidden="true">
            CD
          </span>
          <span>Car Diary</span>
        </a>
        <div>
          <p className="eyebrow">Your complete vehicle history</p>
          <h1>Every service record, available wherever you are.</h1>
          <p>
            Sign in to keep your vehicles, maintenance history, and expenses
            securely synced.
          </p>
        </div>
      </section>

      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-heading">
          <p className="eyebrow">
            {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
          </p>
          <h2 id="auth-title">
            {mode === 'sign-in' ? 'Sign in to Car Diary' : 'Start your diary'}
          </h2>
          <p>
            {mode === 'sign-in'
              ? 'Enter the details connected to your account.'
              : 'Use your email and a password with at least 6 characters.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              autoFocus
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
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

          {error && <p className="form-message form-message-error">{error}</p>}
          {notice && (
            <p className="form-message form-message-success">{notice}</p>
          )}

          <button
            className="button button-primary button-full"
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

        <p className="auth-switch">
          {mode === 'sign-in'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button type="button" onClick={switchMode}>
            {mode === 'sign-in' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </section>
    </main>
  )
}

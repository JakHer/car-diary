interface LoadingScreenProps {
  message: string
}

interface ErrorScreenProps {
  message: string
  onRetry: () => void
}

const statusScreenStyles =
  'mx-auto grid min-h-svh w-[calc(100%_-_40px)] max-w-[520px] place-content-center justify-items-center text-center'

const statusMessageStyles = 'mt-4 mb-0 leading-[1.6] text-muted'

export const LoadingScreen = ({ message }: LoadingScreenProps) => (
  <main className={statusScreenStyles}>
    <span className={brandMarkStyles} aria-hidden="true">
      CD
    </span>
    <div
      className="mt-[30px] size-[9px] animate-[loading-pulse_1.4s_infinite] rounded-full bg-accent shadow-[0_0_0_0_var(--color-accent-soft)]"
      aria-hidden="true"
    />
    <p className={statusMessageStyles}>{message}</p>
  </main>
)

export const ErrorScreen = ({ message, onRetry }: ErrorScreenProps) => (
  <main className={statusScreenStyles}>
    <span className={brandMarkStyles} aria-hidden="true">
      CD
    </span>
    <h1 className="mt-7 mb-0 text-[clamp(30px,6vw,44px)] leading-[1.05] tracking-[-0.04em] text-strong">
      We could not load your garage.
    </h1>
    <p className={statusMessageStyles}>{message}</p>
    <button
      className={`${primaryButtonStyles} mt-6`}
      type="button"
      onClick={onRetry}
    >
      Try again
    </button>
  </main>
)

export const ConfigurationScreen = () => (
  <main className={statusScreenStyles}>
    <span className={brandMarkStyles} aria-hidden="true">
      CD
    </span>
    <h1 className="mt-7 mb-0 text-[clamp(30px,6vw,44px)] leading-[1.05] tracking-[-0.04em] text-strong">
      Supabase is not configured.
    </h1>
    <p className={statusMessageStyles}>
      Add the required values to your `.env.local` file and restart Vite.
    </p>
  </main>
)
import { brandMarkStyles, primaryButtonStyles } from '../styles'

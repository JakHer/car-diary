interface LoadingScreenProps {
  message: string
}

interface ErrorScreenProps {
  message: string
  onRetry: () => void
}

export const LoadingScreen = ({ message }: LoadingScreenProps) => (
  <main className="status-screen">
    <span className="brand-mark" aria-hidden="true">
      CD
    </span>
    <div className="loading-dot" aria-hidden="true" />
    <p>{message}</p>
  </main>
)

export const ErrorScreen = ({ message, onRetry }: ErrorScreenProps) => (
  <main className="status-screen">
    <span className="brand-mark" aria-hidden="true">
      CD
    </span>
    <h1>We could not load your garage.</h1>
    <p>{message}</p>
    <button
      className="button button-primary"
      type="button"
      onClick={onRetry}
    >
      Try again
    </button>
  </main>
)

export const ConfigurationScreen = () => (
  <main className="status-screen">
    <span className="brand-mark" aria-hidden="true">
      CD
    </span>
    <h1>Supabase is not configured.</h1>
    <p>Add the required values to your `.env.local` file and restart Vite.</p>
  </main>
)

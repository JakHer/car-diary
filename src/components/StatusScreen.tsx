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
  <main className={statusScreenStyles} aria-busy="true">
    <span className={brandMarkStyles} aria-hidden="true">
      CD
    </span>
    <Loader className="mt-[30px] text-accent" size="large" />
    <p className={statusMessageStyles} role="status">
      {message}
    </p>
  </main>
)

export const ErrorScreen = ({ message, onRetry }: ErrorScreenProps) => {
  const { t } = useTranslation()

  return (
    <main className={statusScreenStyles}>
    <span className={brandMarkStyles} aria-hidden="true">
      CD
    </span>
    <h1 className="mt-7 mb-0 text-[clamp(30px,6vw,44px)] leading-[1.05] tracking-[-0.04em] text-strong">
      {t('status.errorTitle')}
    </h1>
    <p className={statusMessageStyles}>{message}</p>
    <button
      className={`${primaryButtonStyles} mt-6`}
      type="button"
      onClick={onRetry}
    >
      {t('status.tryAgain')}
    </button>
    </main>
  )
}

export const ConfigurationScreen = () => {
  const { t } = useTranslation()

  return (
    <main className={statusScreenStyles}>
    <span className={brandMarkStyles} aria-hidden="true">
      CD
    </span>
    <h1 className="mt-7 mb-0 text-[clamp(30px,6vw,44px)] leading-[1.05] tracking-[-0.04em] text-strong">
      {t('status.configurationTitle')}
    </h1>
    <p className={statusMessageStyles}>
      {t('status.configurationDescription')}
    </p>
    </main>
  )
}
import { useTranslation } from 'react-i18next'
import { brandMarkStyles, primaryButtonStyles } from '../styles'
import { Loader } from './Loader'

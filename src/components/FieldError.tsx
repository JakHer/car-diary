import { fieldErrorStyles, joinClassNames } from '../styles'

interface FieldErrorProps {
  message?: string
}

export const FieldError = ({ message }: FieldErrorProps) => (
  <span
    className={joinClassNames(
      fieldErrorStyles,
      'block min-h-[17px]',
      !message && 'invisible',
    )}
    aria-hidden={message ? undefined : true}
    role={message ? 'alert' : undefined}
  >
    {message ?? '\u00a0'}
  </span>
)

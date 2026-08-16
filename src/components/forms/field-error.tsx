import { cn } from '@/lib/utils'

interface FieldErrorProps {
  message?: string
}

export const FieldError = ({ message }: FieldErrorProps) => (
  <span
      className={cn(
        'm-0 text-xs font-semibold leading-[1.4] text-danger',
      'block min-h-[17px]',
      !message && 'invisible',
    )}
    aria-hidden={message ? undefined : true}
    role={message ? 'alert' : undefined}
  >
    {message ?? '\u00a0'}
  </span>
)

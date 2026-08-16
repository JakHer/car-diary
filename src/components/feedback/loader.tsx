import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoaderProps {
  className?: string
  label?: string
  size?: 'small' | 'medium' | 'large'
}

const loaderSizeStyles: Record<NonNullable<LoaderProps['size']>, string> = {
  small: 'size-4',
  medium: 'size-6',
  large: 'size-9',
}

export const Loader = ({
  className,
  label,
  size = 'medium',
}: LoaderProps) => (
  <span
    className={cn(
      'inline-flex items-center justify-center gap-2.5',
      className,
    )}
  >
    <LoaderCircle
      aria-hidden="true"
      className={cn(
        'shrink-0 animate-spin motion-reduce:animate-pulse',
        loaderSizeStyles[size],
      )}
      strokeWidth={2.5}
    />
    {label && <span>{label}</span>}
  </span>
)

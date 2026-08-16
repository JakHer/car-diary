import type { ComponentProps, ReactNode } from 'react'
import { Tooltip } from '@/components/overlays/tooltip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface IconButtonProps
  extends Omit<ComponentProps<typeof Button>, 'size' | 'variant'> {
  children: ReactNode
  label: string
  tooltipSide?: 'bottom' | 'left' | 'right' | 'top'
  variant?: 'default' | 'danger' | 'primary'
}

export const IconButton = ({
  children,
  className,
  label,
  tooltipSide,
  type = 'button',
  variant = 'default',
  ...buttonProps
}: IconButtonProps) => (
  <Tooltip label={label} side={tooltipSide}>
    <Button
      {...buttonProps}
      className={cn(
        'shadow-sm',
        variant === 'danger' &&
          'text-muted hover:border-danger/35 hover:bg-danger-soft hover:text-danger focus-visible:ring-danger/10',
        className,
      )}
      size="icon"
      type={type}
      variant={variant === 'primary' ? 'default' : 'outline'}
      aria-label={label}
    >
      {children}
    </Button>
  </Tooltip>
)

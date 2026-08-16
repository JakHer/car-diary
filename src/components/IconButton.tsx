import type { ButtonHTMLAttributes, ReactNode } from 'react'
import {
  dangerIconActionStyles,
  iconActionStyles,
  joinClassNames,
} from '../styles'
import { Tooltip } from './Tooltip'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  label: string
  tooltipSide?: 'bottom' | 'left' | 'right' | 'top'
  variant?: 'default' | 'danger'
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
    <button
      {...buttonProps}
      className={joinClassNames(
        variant === 'danger' ? dangerIconActionStyles : iconActionStyles,
        className,
      )}
      type={type}
      aria-label={label}
    >
      {children}
    </button>
  </Tooltip>
)

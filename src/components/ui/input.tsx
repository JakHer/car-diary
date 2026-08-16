import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Input = ({ className, type, ...props }: ComponentProps<'input'>) => (
  <input
    data-slot="input"
    type={type}
    className={cn(
      'h-[46px] w-full rounded-[10px] border border-border-strong bg-surface px-[13px] text-sm font-medium text-strong outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-light focus:border-ring focus:ring-[3px] focus:ring-ring/10 aria-invalid:border-destructive/50 aria-invalid:ring-[3px] aria-invalid:ring-destructive/10 disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  />
)

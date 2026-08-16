import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => (
  <textarea
    data-slot="textarea"
    className={cn(
      'min-h-[90px] w-full resize-y rounded-[10px] border border-border-strong bg-surface px-[13px] py-3 text-sm font-medium text-strong outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-light focus:border-ring focus:ring-[3px] focus:ring-ring/10 aria-invalid:border-destructive/50 aria-invalid:ring-[3px] aria-invalid:ring-destructive/10 disabled:cursor-not-allowed disabled:opacity-60',
      className,
    )}
    {...props}
  />
)

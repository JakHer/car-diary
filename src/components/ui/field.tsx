import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Field = ({ className, ...props }: ComponentProps<'label'>) => (
  <label
    data-slot="field"
    className={cn('grid gap-2 text-[13px] font-bold text-strong', className)}
    {...props}
  />
)

export const FieldGroup = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    data-slot="field-group"
    className={cn(
      'grid grid-cols-2 gap-5 max-[700px]:grid-cols-1',
      className,
    )}
    {...props}
  />
)

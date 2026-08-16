import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'
import { badgeVariants } from './badge-variants'

export const Badge = ({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

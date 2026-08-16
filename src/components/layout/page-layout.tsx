import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const PageLayout = ({
  className,
  ...props
}: ComponentProps<'main'>) => (
  <main
    className={cn(
      'py-14 pb-20 max-[700px]:py-12 max-[700px]:pb-14',
      className,
    )}
    {...props}
  />
)

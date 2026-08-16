import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DashboardSectionProps {
  actions: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  eyebrow: string
  title: string
  titleId: string
}

export const DashboardSection = ({
  actions,
  children,
  className,
  contentClassName,
  eyebrow,
  title,
  titleId,
}: DashboardSectionProps) => (
  <section
    aria-labelledby={titleId}
    className={cn(
      'rounded-large border border-border bg-surface p-7 shadow-card max-[700px]:p-[22px]',
      className,
    )}
  >
    <div className="flex items-start justify-between gap-5 border-b border-border pb-[22px]">
      <div>
        <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
          {eyebrow}
        </p>
        <h2
          className="m-0 text-[22px] font-bold tracking-[-0.025em] text-strong"
          id={titleId}
        >
          {title}
        </h2>
      </div>
      <div className="flex items-center justify-end gap-2">{actions}</div>
    </div>
    <div className={contentClassName}>{children}</div>
  </section>
)

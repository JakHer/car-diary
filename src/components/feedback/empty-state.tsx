import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  className?: string
  description: string
  icon: LucideIcon
  title: string
}

export const EmptyState = ({
  className,
  description,
  icon: Icon,
  title,
}: EmptyStateProps) => (
  <div
    className={cn(
      'grid min-h-[280px] place-content-center justify-items-center px-5 py-12 text-center',
      className,
    )}
    data-slot="empty-state"
  >
    <span
      aria-hidden="true"
      className="mb-4 grid size-11 place-items-center rounded-full bg-accent-soft text-accent"
    >
      <Icon className="size-5" />
    </span>
    <h3 className="m-0 text-base font-bold text-strong">{title}</h3>
    <p className="mt-2 mb-0 max-w-[360px] text-sm leading-[1.6] text-muted">
      {description}
    </p>
  </div>
)

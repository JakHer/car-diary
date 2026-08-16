import type { ReactNode } from 'react'

interface StatCardProps {
  description: ReactNode
  label: string
  value: ReactNode
}

export const StatCard = ({ description, label, value }: StatCardProps) => (
  <article className="rounded-large border border-border bg-surface p-[22px] shadow-card">
    <span className="text-xs font-bold tracking-[0.03em] text-muted uppercase">
      {label}
    </span>
    <strong className="mt-3 block text-[30px] tracking-[-0.03em] text-strong">
      {value}
    </strong>
    <p className="mt-1 mb-0 text-xs text-muted">{description}</p>
  </article>
)

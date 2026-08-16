import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageHeaderSize = 'default' | 'display' | 'hero'

interface PageHeaderProps {
  aside?: ReactNode
  children?: ReactNode
  className?: string
  description?: string
  eyebrow: string
  size?: PageHeaderSize
  title: ReactNode
}

const titleStyles: Record<PageHeaderSize, string> = {
  default:
    'text-[clamp(36px,6vw,58px)] leading-none tracking-[-0.05em]',
  display:
    'text-[clamp(36px,6vw,66px)] leading-[0.98] tracking-[-0.055em]',
  hero: 'text-[clamp(44px,7vw,78px)] leading-[0.98] tracking-[-0.06em]',
}

const descriptionStyles: Record<PageHeaderSize, string> = {
  default: 'mt-4 max-w-[620px] text-sm leading-[1.65]',
  display: 'mt-4 max-w-[620px] text-sm leading-[1.65]',
  hero: 'mt-6 max-w-[520px] text-base leading-[1.7]',
}

export const PageHeader = ({
  aside,
  children,
  className,
  description,
  eyebrow,
  size = 'default',
  title,
}: PageHeaderProps) => (
  <header
    className={cn(
      aside &&
        'flex items-end justify-between gap-10 max-[700px]:flex-col max-[700px]:items-start',
      className,
    )}
  >
    <div>
      <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
        {eyebrow}
      </p>
      <h1 className={cn('m-0 text-strong', titleStyles[size])}>{title}</h1>
      {description && (
        <p className={cn('mb-0 text-muted', descriptionStyles[size])}>
          {description}
        </p>
      )}
      {children}
    </div>
    {aside}
  </header>
)

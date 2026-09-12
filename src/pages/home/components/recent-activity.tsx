import { useMemo } from 'react'
import { ArrowUpRight, Fuel, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { FuelEntry, ServiceRecord } from '@/types'
import type { VehicleSection } from '@/app/routing/vehicle-routes'
import { DashboardSection } from '@/components/layout/dashboard-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface RecentActivityProps {
  fuelEntries: FuelEntry[]
  locale: string
  records: ServiceRecord[]
  onOpenVehicleSection: (
    section: Exclude<VehicleSection, 'overview'>,
  ) => void
}

export const RecentActivity = ({
  fuelEntries,
  locale,
  records,
  onOpenVehicleSection,
}: RecentActivityProps) => {
  const { t } = useTranslation()
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  )
  const volumeFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
      }),
    [locale],
  )
  const recentActivity = [
    ...records.map((record) => ({
      date: record.date,
      id: `service-${record.id}`,
      title: record.title,
      type: 'service' as const,
    })),
    ...fuelEntries.map((entry) => ({
      date: entry.date,
      id: `fuel-${entry.id}`,
      title: t('home.fuelActivity', {
        volume: volumeFormatter.format(entry.volumeInMilliliters / 1_000),
      }),
      type: 'fuel' as const,
    })),
  ]
    .toSorted((first, second) => second.date.localeCompare(first.date))
    .slice(0, 4)

  return (
    <DashboardSection
      actions={<Badge variant="secondary">{recentActivity.length}</Badge>}
      contentClassName="mt-2"
      eyebrow={t('home.activityEyebrow')}
      title={t('home.recentTitle')}
      titleId="home-activity-title"
    >
      {recentActivity.length === 0 ? (
        <p className="my-8 text-center text-sm text-muted">
          {t('home.noActivity')}
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {recentActivity.map((activity) => {
            const Icon = activity.type === 'fuel' ? Fuel : Wrench

            return (
              <li
                className="border-b border-border last:border-b-0"
                key={activity.id}
              >
                <Button
                  aria-label={t('home.openActivity', {
                    title: activity.title,
                  })}
                  className="group grid h-auto w-full grid-cols-[36px_minmax(0,1fr)_16px] gap-3 whitespace-normal rounded-lg px-3 py-4 text-left hover:translate-y-0"
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenVehicleSection(activity.type)}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-muted text-muted transition-colors group-hover:bg-accent-soft group-hover:text-accent">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span>
                    <strong className="block text-sm text-strong">
                      {activity.title}
                    </strong>
                    <span className="mt-1 block text-xs font-medium text-muted">
                      {dateFormatter.format(
                        new Date(`${activity.date}T12:00:00`),
                      )}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardSection>
  )
}

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight, BellRing, Fuel, Wrench } from 'lucide-react'
import type { FuelEntry, MaintenanceReminder, ServiceRecord } from '@/types'
import { getVehicleSectionPath } from '@/app/routing/vehicle-routes'
import { StatCard } from '@/components/data-display/stat-card'

interface VehicleOverviewProps {
  fuelEntries: FuelEntry[]
  locale: string
  records: ServiceRecord[]
  reminders: MaintenanceReminder[]
  vehicleId: string
}

export const VehicleOverview = ({
  fuelEntries,
  locale,
  records,
  reminders,
  vehicleId,
}: VehicleOverviewProps) => {
  const { t } = useTranslation()
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0,
      }),
    [locale],
  )
  const lastServiceFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  )
  const totalCost = records.reduce(
    (sum, record) => sum + record.costInCents,
    0,
  )
  const activeReminderCount = reminders.filter(
    (reminder) => !reminder.completedAt,
  ).length
  const sectionCards = [
    {
      count: records.length,
      description: t('vehicleSections.serviceDescription'),
      icon: Wrench,
      id: 'service' as const,
    },
    {
      count: fuelEntries.length,
      description: t('vehicleSections.fuelDescription'),
      icon: Fuel,
      id: 'fuel' as const,
    },
    {
      count: activeReminderCount,
      description: t('vehicleSections.remindersDescription'),
      icon: BellRing,
      id: 'reminders' as const,
    },
  ]

  return (
    <>
      <section
        className="mt-7 grid grid-cols-3 gap-4 max-[700px]:grid-cols-1 max-[700px]:gap-3"
        aria-label={t('dashboard.summaryAria')}
      >
        <StatCard
          description={t('dashboard.recordedForVehicle')}
          label={t('dashboard.serviceEntries')}
          value={records.length}
        />
        <StatCard
          description={t('dashboard.acrossEntries')}
          label={t('dashboard.totalServiceCost')}
          value={currencyFormatter.format(totalCost / 100)}
        />
        <StatCard
          description={records[0]?.title ?? t('dashboard.addFirstRecord')}
          label={t('dashboard.lastService')}
          value={
            records[0]
              ? lastServiceFormatter.format(
                  new Date(`${records[0].date}T12:00:00`),
                )
              : t('dashboard.notYet')
          }
        />
      </section>

      <section
        className="mt-6 grid grid-cols-3 gap-4 max-[800px]:grid-cols-1"
        aria-label={t('vehicleSections.sections')}
      >
        {sectionCards.map(({ count, description, icon: Icon, id }) => (
          <Link
            className="group flex min-h-32 items-center gap-4 rounded-large border border-border bg-surface p-5 text-strong no-underline shadow-card transition-[border-color,transform] hover:-translate-y-0.5 hover:border-accent"
            key={id}
            to={getVehicleSectionPath(vehicleId, id)}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-base">
                {t(`vehicleSections.${id}`)}
              </strong>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {description}
              </span>
            </span>
            <span className="grid justify-items-end gap-3">
              <strong className="text-xl">{count}</strong>
              <ArrowRight
                aria-hidden="true"
                className="size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
              />
            </span>
          </Link>
        ))}
      </section>
    </>
  )
}

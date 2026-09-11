import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowRight, BellRing, Fuel, PhoneCall, ShieldCheck, Wrench } from 'lucide-react'
import type { FuelEntry, MaintenanceReminder, ServiceRecord, Vehicle } from '@/types'
import { getVehicleSectionPath } from '@/app/routing/vehicle-routes'
import { StatCard } from '@/components/data-display/stat-card'
import { Button } from '@/components/ui/button'
import { getTelephoneHref } from '@/lib/phone-numbers'

interface VehicleOverviewProps {
  fuelEntries: FuelEntry[]
  locale: string
  records: ServiceRecord[]
  reminders: MaintenanceReminder[]
  vehicle: Vehicle
  onEditVehicle: () => void
}

export const VehicleOverview = ({
  fuelEntries,
  locale,
  records,
  reminders,
  vehicle,
  onEditVehicle,
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
      <section className="mt-7 flex items-center gap-4 rounded-large border border-border bg-surface p-5 shadow-card max-[620px]:flex-col max-[620px]:items-stretch">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          <ShieldCheck aria-hidden="true" className="size-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[11px] font-extrabold tracking-[0.07em] text-accent uppercase">
            {t('assistance.eyebrow')}
          </p>
          <h2 className="mt-1 mb-0 text-lg font-bold text-strong">
            {vehicle.insurerName || t('assistance.title')}
          </h2>
          {vehicle.policyNumber && (
            <p className="mt-1 mb-0 text-xs text-muted">
              {t('assistance.policy', { number: vehicle.policyNumber })}
            </p>
          )}
        </div>
        {vehicle.assistancePhone ? (
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-primary px-[18px] py-2 text-sm font-bold whitespace-nowrap text-primary-foreground no-underline transition-[transform,background-color] hover:-translate-y-px hover:bg-primary/90"
            href={getTelephoneHref(vehicle.assistancePhone)}
          >
            <PhoneCall aria-hidden="true" className="size-4" />
            {t('assistance.call')}
            <span className="font-medium opacity-80">
              {vehicle.assistancePhone}
            </span>
          </a>
        ) : (
          <Button type="button" variant="outline" onClick={onEditVehicle}>
            <PhoneCall aria-hidden="true" className="size-4" />
            {t('assistance.add')}
          </Button>
        )}
      </section>

      <section
        className="mt-6 grid grid-cols-3 gap-4 max-[700px]:grid-cols-1 max-[700px]:gap-3"
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
            to={getVehicleSectionPath(vehicle.id, id)}
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

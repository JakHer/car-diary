import { useMemo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { MaintenanceReminder, Vehicle } from '@/types'
import type { VehicleSection } from '@/app/routing/vehicle-routes'
import { formatDistance } from '@/lib/distance-units'
import { getMaintenanceReminderStatus } from '@/lib/maintenance-reminders'
import { DashboardSection } from '@/components/layout/dashboard-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface UpcomingRemindersProps {
  locale: string
  reminders: MaintenanceReminder[]
  vehicle: Vehicle
  onOpenVehicleSection: (
    section: Exclude<VehicleSection, 'overview'>,
  ) => void
}

export const UpcomingReminders = ({
  locale,
  reminders,
  vehicle,
  onOpenVehicleSection,
}: UpcomingRemindersProps) => {
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
  const upcomingReminders = reminders
    .filter((reminder) => !reminder.completedAt)
    .toSorted((first, second) => {
      const firstStatus = getMaintenanceReminderStatus(
        first,
        vehicle.currentMileage,
      )
      const secondStatus = getMaintenanceReminderStatus(
        second,
        vehicle.currentMileage,
      )
      if (firstStatus !== secondStatus) {
        return firstStatus === 'overdue' ? -1 : 1
      }

      return (first.dueDate ?? '9999-12-31').localeCompare(
        second.dueDate ?? '9999-12-31',
      )
    })
    .slice(0, 3)

  return (
    <DashboardSection
      actions={<Badge variant="secondary">{upcomingReminders.length}</Badge>}
      contentClassName="mt-2"
      eyebrow={t('home.planEyebrow')}
      title={t('home.upcomingTitle')}
      titleId="home-reminders-title"
    >
      {upcomingReminders.length === 0 ? (
        <p className="my-8 text-center text-sm text-muted">
          {t('home.noUpcoming')}
        </p>
      ) : (
        <ul className="m-0 list-none p-0">
          {upcomingReminders.map((reminder) => {
            const status = getMaintenanceReminderStatus(
              reminder,
              vehicle.currentMileage,
            )
            const targets = [
              reminder.dueDate
                ? dateFormatter.format(
                    new Date(`${reminder.dueDate}T12:00:00`),
                  )
                : null,
              reminder.dueMileage !== null
                ? formatDistance(
                    reminder.dueMileage,
                    vehicle.distanceUnit,
                    locale,
                  )
                : null,
            ].filter(Boolean)

            return (
              <li
                className="border-b border-border last:border-b-0"
                key={reminder.id}
              >
                <Button
                  aria-label={t('home.openReminder', {
                    title: reminder.title,
                  })}
                  className="group grid h-auto w-full grid-cols-[minmax(0,1fr)_auto_16px] gap-3 whitespace-normal rounded-lg px-3 py-4 text-left hover:translate-y-0"
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenVehicleSection('reminders')}
                >
                  <span>
                    <strong className="block text-sm text-strong">
                      {reminder.title}
                    </strong>
                    <span className="mt-1 block text-xs font-medium text-muted">
                      {targets.join(' · ')}
                    </span>
                  </span>
                  <Badge variant={status === 'overdue' ? 'danger' : 'success'}>
                    {t(
                      status === 'overdue'
                        ? 'reminders.dueNow'
                        : 'reminders.upcoming',
                    )}
                  </Badge>
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

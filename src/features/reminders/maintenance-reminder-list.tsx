import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BellRing, Check, RotateCcw, Trash2 } from 'lucide-react'
import type { DistanceUnit, MaintenanceReminder } from '@/types'
import { IconButton } from '@/components/actions/icon-button'
import { EmptyState } from '@/components/feedback/empty-state'
import { Badge } from '@/components/ui/badge'
import { formatDistance } from '@/lib/distance-units'
import {
  getMaintenanceReminderStatus,
  type MaintenanceReminderStatus,
} from '@/lib/maintenance-reminders'

interface MaintenanceReminderListProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  locale: string
  reminders: MaintenanceReminder[]
  onDelete: (reminderId: string) => void
  onToggleCompleted: (reminderId: string, completed: boolean) => void
}

const statusOrder: Record<MaintenanceReminderStatus, number> = {
  overdue: 0,
  upcoming: 1,
  completed: 2,
}

export const MaintenanceReminderList = ({
  currentMileage,
  distanceUnit,
  locale,
  reminders,
  onDelete,
  onToggleCompleted,
}: MaintenanceReminderListProps) => {
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
  const orderedReminders = reminders.toSorted((first, second) => {
    const firstStatus = getMaintenanceReminderStatus(first, currentMileage)
    const secondStatus = getMaintenanceReminderStatus(second, currentMileage)

    return (
      statusOrder[firstStatus] - statusOrder[secondStatus] ||
      (first.dueDate ?? '9999-12-31').localeCompare(
        second.dueDate ?? '9999-12-31',
      ) ||
      (first.dueMileage ?? Number.MAX_SAFE_INTEGER) -
        (second.dueMileage ?? Number.MAX_SAFE_INTEGER)
    )
  })

  if (orderedReminders.length === 0) {
    return (
      <EmptyState
        description={t('reminders.emptyDescription')}
        icon={BellRing}
        title={t('reminders.emptyTitle')}
      />
    )
  }

  return (
    <ul className="m-0 list-none p-0">
      {orderedReminders.map((reminder) => {
        const status = getMaintenanceReminderStatus(reminder, currentMileage)

        return (
          <li
            className="flex items-start justify-between gap-5 border-b border-border py-4 first:pt-0 last:border-b-0 max-[700px]:flex-col"
            key={reminder.id}
          >
            <div className={status === 'completed' ? 'opacity-[0.62]' : ''}>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="m-0 text-base font-bold text-strong">
                  {reminder.title}
                </h3>
                <Badge
                  className="text-[10px] font-extrabold tracking-[0.06em] uppercase"
                  variant={
                    status === 'completed'
                      ? 'success'
                      : status === 'overdue'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {status === 'completed'
                    ? t('reminders.completed')
                    : status === 'overdue'
                      ? t('reminders.dueNow')
                      : t('reminders.upcoming')}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-[18px] gap-y-2 text-[13px] text-muted">
                {reminder.dueDate && (
                  <span>
                    {t('reminders.due', {
                      date: dateFormatter.format(
                        new Date(`${reminder.dueDate}T12:00:00`),
                      ),
                    })}
                  </span>
                )}
                {reminder.dueMileage !== null && (
                  <span>
                    {t('reminders.atMileage', {
                      distance: formatDistance(
                        reminder.dueMileage,
                        distanceUnit,
                        locale,
                      ),
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <IconButton
                label={
                  status === 'completed'
                    ? t('reminders.reopen')
                    : t('reminders.complete')
                }
                onClick={() =>
                  onToggleCompleted(reminder.id, status !== 'completed')
                }
              >
                {status === 'completed' ? (
                  <RotateCcw aria-hidden="true" className="size-4" />
                ) : (
                  <Check aria-hidden="true" className="size-4" />
                )}
              </IconButton>
              <IconButton
                label={t('common.delete')}
                variant="danger"
                onClick={() => onDelete(reminder.id)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </IconButton>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

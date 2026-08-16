import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import type {
  DistanceUnit,
  MaintenanceReminder,
  MaintenanceReminderInput,
} from '@/types'
import { getIntlLocale } from '@/i18n'
import { IconButton } from '@/components/actions/icon-button'
import { FormDialog } from '@/components/overlays/form-dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MaintenanceReminderForm } from './maintenance-reminder-form'
import { MaintenanceReminderList } from './maintenance-reminder-list'

interface MaintenanceRemindersProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  isSaving: boolean
  reminders: MaintenanceReminder[]
  onCreate: (input: MaintenanceReminderInput) => Promise<void>
  onDelete: (reminderId: string) => void
  onToggleCompleted: (reminderId: string, completed: boolean) => void
}

export const MaintenanceReminders = ({
  currentMileage,
  distanceUnit,
  isSaving,
  reminders,
  onCreate,
  onDelete,
  onToggleCompleted,
}: MaintenanceRemindersProps) => {
  const { i18n, t } = useTranslation()
  const [formOpen, setFormOpen] = useState(false)
  const locale = getIntlLocale(i18n.resolvedLanguage)
  const activeReminderCount = reminders.filter(
    (reminder) => !reminder.completedAt,
  ).length

  return (
    <section
      className={cn(
        'rounded-large border border-border bg-surface shadow-card',
        'mt-6 p-7 max-[700px]:p-[22px]',
      )}
      aria-labelledby="reminders-title"
    >
      <div
        className={cn(
          'flex items-start justify-between gap-5',
          'border-b border-border pb-[22px]',
        )}
      >
        <div>
          <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
            {t('reminders.eyebrow')}
          </p>
          <h2
            className="m-0 text-[22px] font-bold tracking-[-0.025em] text-strong"
            id="reminders-title"
          >
            {t('reminders.title')}
          </h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Badge className="whitespace-nowrap" variant="secondary">
            {t('reminders.active', { count: activeReminderCount })}
          </Badge>
          <IconButton
            label={t('reminders.add')}
            tooltipSide="bottom"
            variant="primary"
            onClick={() => setFormOpen(true)}
          >
            <Plus aria-hidden="true" className="size-4" />
          </IconButton>
        </div>
      </div>

      <div className="mt-[22px]">
        <MaintenanceReminderList
          currentMileage={currentMileage}
          distanceUnit={distanceUnit}
          locale={locale}
          reminders={reminders}
          onDelete={onDelete}
          onToggleCompleted={onToggleCompleted}
        />
      </div>

      <FormDialog
        closeLabel={t('reminders.close')}
        description={t('reminders.addDescription')}
        isBusy={isSaving}
        open={formOpen}
        title={t('reminders.add')}
        onOpenChange={setFormOpen}
      >
        <MaintenanceReminderForm
          currentMileage={currentMileage}
          distanceUnit={distanceUnit}
          isSaving={isSaving}
          onCreate={onCreate}
          onCreated={() => setFormOpen(false)}
        />
      </FormDialog>
    </section>
  )
}

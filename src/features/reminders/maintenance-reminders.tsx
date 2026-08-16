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
import { DashboardSection } from '@/components/layout/dashboard-section'
import { FormDialog } from '@/components/overlays/form-dialog'
import { Badge } from '@/components/ui/badge'
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
    <DashboardSection
      actions={
        <>
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
        </>
      }
      className="mt-6"
      contentClassName="mt-[22px]"
      eyebrow={t('reminders.eyebrow')}
      title={t('reminders.title')}
      titleId="reminders-title"
    >
      <MaintenanceReminderList
        currentMileage={currentMileage}
        distanceUnit={distanceUnit}
        locale={locale}
        reminders={reminders}
        onDelete={onDelete}
        onToggleCompleted={onToggleCompleted}
      />

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
    </DashboardSection>
  )
}

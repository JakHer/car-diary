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
  onUpdate: (
    reminderId: string,
    input: MaintenanceReminderInput,
  ) => Promise<void>
  onToggleCompleted: (reminderId: string, completed: boolean) => void
}

export const MaintenanceReminders = ({
  currentMileage,
  distanceUnit,
  isSaving,
  reminders,
  onCreate,
  onDelete,
  onUpdate,
  onToggleCompleted,
}: MaintenanceRemindersProps) => {
  const { i18n, t } = useTranslation()
  const [formOpen, setFormOpen] = useState(false)
  const [editingReminder, setEditingReminder] =
    useState<MaintenanceReminder | null>(null)
  const locale = getIntlLocale(i18n.resolvedLanguage)
  const activeReminderCount = reminders.filter(
    (reminder) => !reminder.completedAt,
  ).length
  const openCreateForm = () => {
    setEditingReminder(null)
    setFormOpen(true)
  }
  const openEditForm = (reminderId: string) => {
    const reminder = reminders.find(({ id }) => id === reminderId)
    if (!reminder) return

    setEditingReminder(reminder)
    setFormOpen(true)
  }
  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingReminder(null)
  }
  const saveReminder = (input: MaintenanceReminderInput) =>
    editingReminder
      ? onUpdate(editingReminder.id, input)
      : onCreate(input)

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
            onClick={openCreateForm}
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
        onEdit={openEditForm}
        onToggleCompleted={onToggleCompleted}
      />

      <FormDialog
        closeLabel={t('reminders.close')}
        description={t(
          editingReminder
            ? 'reminders.editDescription'
            : 'reminders.addDescription',
        )}
        isBusy={isSaving}
        open={formOpen}
        title={t(
          editingReminder ? 'reminders.editTitle' : 'reminders.add',
        )}
        onOpenChange={handleFormOpenChange}
      >
        <MaintenanceReminderForm
          key={editingReminder?.id ?? 'new'}
          currentMileage={currentMileage}
          distanceUnit={distanceUnit}
          isSaving={isSaving}
          reminder={editingReminder ?? undefined}
          onSave={saveReminder}
          onSaved={() => handleFormOpenChange(false)}
        />
      </FormDialog>
    </DashboardSection>
  )
}

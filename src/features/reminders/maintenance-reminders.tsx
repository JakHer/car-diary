import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  DistanceUnit,
  MaintenanceReminder,
  MaintenanceReminderInput,
} from '@/types'
import { DatePicker } from '@/components/forms/date-picker'
import { useTranslatedFormErrors } from '@/hooks/use-translated-form-errors'
import { FieldError } from '@/components/forms/field-error'
import { Loader } from '@/components/feedback/loader'
import { IconButton } from '@/components/actions/icon-button'
import { FormDialog } from '@/components/overlays/form-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  createMaintenanceReminderSchema,
  type MaintenanceReminderFormValues,
} from '@/lib/validation'
import {
  getMaintenanceReminderStatus,
  type MaintenanceReminderStatus,
} from '@/lib/maintenance-reminders'
import { cn } from '@/lib/utils'
import { getIntlLocale } from '@/i18n'
import { formatDistance } from '@/lib/distance-units'

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
  const schema = useMemo(
    () => createMaintenanceReminderSchema(t),
    [t],
  )
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  )
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    trigger,
  } = useForm<MaintenanceReminderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      dueDate: '',
      dueMileage: null,
    },
    mode: 'onBlur',
  })
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)
  const orderedReminders = reminders.toSorted((first, second) => {
    const statusOrder: Record<MaintenanceReminderStatus, number> = {
      overdue: 0,
      upcoming: 1,
      completed: 2,
    }
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

  const createReminder = async ({
    title,
    dueDate,
    dueMileage,
  }: MaintenanceReminderFormValues) => {
    try {
      await onCreate({
        title,
        dueDate: dueDate || null,
        dueMileage,
      })
    } catch {
      return
    }

    reset()
    setFormOpen(false)
  }

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
          <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase">{t('reminders.eyebrow')}</p>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.025em] text-strong" id="reminders-title">
            {t('reminders.title')}
          </h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Badge className="whitespace-nowrap" variant="secondary">
            {t('reminders.active', {
              count: reminders.filter((reminder) => !reminder.completedAt)
                .length,
            })}
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
        {orderedReminders.length === 0 ? (
          <div className="grid min-h-40 place-content-center text-center">
            <p className="m-0 font-bold text-strong">
              {t('reminders.emptyTitle')}
            </p>
            <span className="mt-1.5 text-[13px] text-muted">
              {t('reminders.emptyDescription')}
            </span>
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {orderedReminders.map((reminder) => {
              const status = getMaintenanceReminderStatus(
                reminder,
                currentMileage,
              )

              return (
                <li
                  className="flex items-start justify-between gap-5 border-b border-border py-4 first:pt-0 last:border-b-0 max-[700px]:flex-col"
                  key={reminder.id}
                >
                  <div
                    className={status === 'completed' ? 'opacity-[0.62]' : ''}
                  >
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
                        <span>{t('reminders.due', {
                          date: dateFormatter.format(
                            new Date(`${reminder.dueDate}T12:00:00`),
                          ),
                        })}</span>
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
                        onToggleCompleted(
                          reminder.id,
                          status !== 'completed',
                        )
                      }
                    >
                      {status === 'completed'
                        ? <RotateCcw aria-hidden="true" className="size-4" />
                        : <Check aria-hidden="true" className="size-4" />}
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
        )}
      </div>

      <FormDialog
        closeLabel={t('reminders.close')}
        description={t('reminders.addDescription')}
        isBusy={isSaving}
        open={formOpen}
        title={t('reminders.add')}
        onOpenChange={setFormOpen}
      >
        <form
          className="grid gap-4"
          aria-busy={isSaving}
          noValidate
          onSubmit={handleSubmit(createReminder)}
        >
          <Field>
            <span>{t('reminders.reminder')}</span>
            <Input
              placeholder={t('reminders.placeholder')}
              maxLength={160}
              aria-label={t('reminders.reminder')}
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
            <FieldError message={errors.title?.message} />
          </Field>
          <FieldGroup className="gap-4">
            <Field>
              <span>{t('reminders.dueDate')}</span>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DatePicker
                    invalid={Boolean(errors.dueDate)}
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <FieldError message={errors.dueDate?.message} />
            </Field>
            <Field>
              <span>{t('reminders.dueMileage', { unit: distanceUnit })}</span>
              <Input
                type="number"
                min="0"
                step="1"
                placeholder={String(currentMileage + 10_000)}
                aria-label={t('reminders.dueMileage', {
                  unit: distanceUnit,
                })}
                aria-invalid={Boolean(errors.dueMileage)}
                {...register('dueMileage', {
                  setValueAs: (value) =>
                    value === null || String(value).trim() === ''
                      ? null
                      : Number(value),
                })}
              />
              <FieldError message={errors.dueMileage?.message} />
            </Field>
          </FieldGroup>
          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader label={t('reminders.adding')} size="small" />
            ) : (
              t('reminders.add')
            )}
          </Button>
        </form>
      </FormDialog>
    </section>
  )
}

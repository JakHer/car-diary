import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  DistanceUnit,
  MaintenanceReminder,
  MaintenanceReminderInput,
} from '../types'
import { DatePicker } from './DatePicker'
import { useTranslatedFormErrors } from '../hooks/useTranslatedFormErrors'
import { FieldError } from './FieldError'
import { Loader } from './Loader'
import {
  createMaintenanceReminderSchema,
  type MaintenanceReminderFormValues,
} from '../lib/validation'
import {
  getMaintenanceReminderStatus,
  type MaintenanceReminderStatus,
} from '../lib/maintenanceReminders'
import {
  cardStyles,
  dangerActionStyles,
  eyebrowStyles,
  fieldStyles,
  formGridStyles,
  inputStyles,
  invalidControlStyles,
  joinClassNames,
  primaryButtonStyles,
  sectionHeadingStyles,
  sectionTitleStyles,
  smallActionStyles,
  tagStyles,
} from '../styles'
import { getIntlLocale } from '../i18n'
import { formatDistance } from '../lib/distanceUnits'

const reminderStatusStyles: Record<MaintenanceReminderStatus, string> = {
  upcoming: 'bg-accent-soft text-accent',
  overdue: 'bg-[#fbeaea] text-[#a62b2b]',
  completed: 'bg-surface-muted text-muted',
}

interface MaintenanceRemindersProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  isSaving: boolean
  reminders: MaintenanceReminder[]
  onCreate: (input: MaintenanceReminderInput) => void
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

  const createReminder = ({
    title,
    dueDate,
    dueMileage,
  }: MaintenanceReminderFormValues) => {
    onCreate({
      title,
      dueDate: dueDate || null,
      dueMileage,
    })
    reset()
  }

  return (
    <section
      className={joinClassNames(
        cardStyles,
        'mt-6 p-7 max-[700px]:p-[22px]',
      )}
      aria-labelledby="reminders-title"
    >
      <div
        className={joinClassNames(
          sectionHeadingStyles,
          'border-b border-border pb-[22px]',
        )}
      >
        <div>
          <p className={eyebrowStyles}>{t('reminders.eyebrow')}</p>
          <h2 className={sectionTitleStyles} id="reminders-title">
            {t('reminders.title')}
          </h2>
        </div>
        <span className={joinClassNames(tagStyles, 'whitespace-nowrap')}>
          {t('reminders.active', {
            count: reminders.filter((reminder) => !reminder.completedAt)
              .length,
          })}
        </span>
      </div>

      <div className="mt-[22px] grid grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)] items-start gap-7 max-[980px]:grid-cols-1">
        <form
          className="grid gap-4"
          aria-busy={isSaving}
          noValidate
          onSubmit={handleSubmit(createReminder)}
        >
          <label className={fieldStyles}>
            <span>{t('reminders.reminder')}</span>
            <input
              className={joinClassNames(
                inputStyles,
                errors.title && invalidControlStyles,
              )}
              placeholder={t('reminders.placeholder')}
              maxLength={160}
              aria-label={t('reminders.reminder')}
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
            <FieldError message={errors.title?.message} />
          </label>
          <div className={joinClassNames(formGridStyles, 'gap-4')}>
            <label className={fieldStyles}>
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
            </label>
            <label className={fieldStyles}>
              <span>{t('reminders.dueMileage', { unit: distanceUnit })}</span>
              <input
                className={joinClassNames(
                  inputStyles,
                  errors.dueMileage && invalidControlStyles,
                )}
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
            </label>
          </div>
          <button
            className={joinClassNames(primaryButtonStyles, 'justify-self-start')}
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader label={t('reminders.adding')} size="small" />
            ) : (
              t('reminders.add')
            )}
          </button>
        </form>

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
                      <span
                        className={joinClassNames(
                          'rounded-full px-2 py-1 text-[10px] font-extrabold tracking-[0.06em] uppercase',
                          reminderStatusStyles[status],
                        )}
                      >
                        {status === 'completed'
                          ? t('reminders.completed')
                          : status === 'overdue'
                            ? t('reminders.dueNow')
                            : t('reminders.upcoming')}
                      </span>
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
                    <button
                      className={smallActionStyles}
                      type="button"
                      onClick={() =>
                        onToggleCompleted(
                          reminder.id,
                          status !== 'completed',
                        )
                      }
                    >
                      {status === 'completed'
                        ? t('reminders.reopen')
                        : t('reminders.complete')}
                    </button>
                    <button
                      className={dangerActionStyles}
                      type="button"
                      onClick={() => onDelete(reminder.id)}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  MaintenanceReminder,
  MaintenanceReminderInput,
} from '../types'
import { DatePicker } from './DatePicker'
import {
  maintenanceReminderSchema,
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
  fieldErrorStyles,
  fieldStyles,
  formErrorStyles,
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

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const reminderStatusStyles: Record<MaintenanceReminderStatus, string> = {
  upcoming: 'bg-accent-soft text-accent',
  overdue: 'bg-[#fbeaea] text-[#a62b2b]',
  completed: 'bg-surface-muted text-muted',
}

interface MaintenanceRemindersProps {
  currentMileage: number
  reminders: MaintenanceReminder[]
  onCreate: (input: MaintenanceReminderInput) => void
  onDelete: (reminderId: string) => void
  onToggleCompleted: (reminderId: string, completed: boolean) => void
}

export const MaintenanceReminders = ({
  currentMileage,
  reminders,
  onCreate,
  onDelete,
  onToggleCompleted,
}: MaintenanceRemindersProps) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<MaintenanceReminderFormValues>({
    resolver: zodResolver(maintenanceReminderSchema),
    defaultValues: {
      title: '',
      dueDate: '',
      dueMileage: null,
    },
    mode: 'onBlur',
  })
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
          <p className={eyebrowStyles}>Plan ahead</p>
          <h2 className={sectionTitleStyles} id="reminders-title">
            Maintenance reminders
          </h2>
        </div>
        <span className={joinClassNames(tagStyles, 'whitespace-nowrap')}>
          {reminders.filter((reminder) => !reminder.completedAt).length} active
        </span>
      </div>

      <div className="mt-[22px] grid grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)] items-start gap-7 max-[980px]:grid-cols-1">
        <form
          className="grid gap-4"
          noValidate
          onSubmit={handleSubmit(createReminder)}
        >
          <label className={fieldStyles}>
            <span>Reminder</span>
            <input
              className={joinClassNames(
                inputStyles,
                errors.title && invalidControlStyles,
              )}
              placeholder="e.g. Replace timing belt"
              maxLength={160}
              aria-label="Reminder"
              aria-invalid={Boolean(errors.title)}
              {...register('title')}
            />
            {errors.title && (
              <p className={fieldErrorStyles} role="alert">
                {errors.title.message}
              </p>
            )}
          </label>
          <div className={joinClassNames(formGridStyles, 'gap-4')}>
            <label className={fieldStyles}>
              <span>Due date</span>
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
            </label>
            <label className={fieldStyles}>
              <span>Due mileage (km)</span>
              <input
                className={joinClassNames(
                  inputStyles,
                  errors.dueMileage && invalidControlStyles,
                )}
                type="number"
                min="0"
                step="1"
                placeholder={String(currentMileage + 10_000)}
                aria-label="Due mileage (km)"
                aria-invalid={Boolean(errors.dueMileage)}
                {...register('dueMileage', {
                  setValueAs: (value) =>
                    value === null || String(value).trim() === ''
                      ? null
                      : Number(value),
                })}
              />
            </label>
          </div>
          {(errors.dueDate || errors.dueMileage) && (
            <p className={formErrorStyles} role="alert">
              {errors.dueDate?.message ?? errors.dueMileage?.message}
            </p>
          )}
          <button
            className={joinClassNames(primaryButtonStyles, 'justify-self-start')}
            type="submit"
          >
            Add reminder
          </button>
        </form>

        {orderedReminders.length === 0 ? (
          <div className="grid min-h-40 place-content-center text-center">
            <p className="m-0 font-bold text-strong">No reminders yet.</p>
            <span className="mt-1.5 text-[13px] text-muted">
              Add a date or mileage target for the next service.
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
                          ? 'Completed'
                          : status === 'overdue'
                            ? 'Due now'
                            : 'Upcoming'}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-[18px] gap-y-2 text-[13px] text-muted">
                      {reminder.dueDate && (
                        <span>
                          Due{' '}
                          {dateFormatter.format(
                            new Date(`${reminder.dueDate}T12:00:00`),
                          )}
                        </span>
                      )}
                      {reminder.dueMileage !== null && (
                        <span>
                          At {reminder.dueMileage.toLocaleString('en-GB')} km
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
                      {status === 'completed' ? 'Reopen' : 'Complete'}
                    </button>
                    <button
                      className={dangerActionStyles}
                      type="button"
                      onClick={() => onDelete(reminder.id)}
                    >
                      Delete
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

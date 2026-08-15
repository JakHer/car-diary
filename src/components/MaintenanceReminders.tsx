import { useState, type FormEvent } from 'react'
import type {
  MaintenanceReminder,
  MaintenanceReminderInput,
} from '../types'
import { DatePicker } from './DatePicker'
import {
  getMaintenanceReminderStatus,
  type MaintenanceReminderStatus,
} from '../lib/maintenanceReminders'
import {
  cardStyles,
  dangerActionStyles,
  eyebrowStyles,
  fieldStyles,
  formErrorStyles,
  formGridStyles,
  inputStyles,
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
  const [formError, setFormError] = useState<string | null>(null)
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const dueDate = String(data.get('dueDate')) || null
    const dueMileageValue = String(data.get('dueMileage')).trim()
    const dueMileage = dueMileageValue ? Number(dueMileageValue) : null

    if (!dueDate && dueMileage === null) {
      setFormError('Add a due date, due mileage, or both.')
      return
    }

    setFormError(null)
    onCreate({
      title: String(data.get('title')).trim(),
      dueDate,
      dueMileage,
    })
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
          key={reminders.length}
          className="grid gap-4"
          onSubmit={handleSubmit}
        >
          <label className={fieldStyles}>
            <span>Reminder</span>
            <input
              className={inputStyles}
              name="title"
              placeholder="e.g. Replace timing belt"
              maxLength={160}
              required
            />
          </label>
          <div className={joinClassNames(formGridStyles, 'gap-4')}>
            <label className={fieldStyles}>
              <span>Due date</span>
              <DatePicker name="dueDate" />
            </label>
            <label className={fieldStyles}>
              <span>Due mileage (km)</span>
              <input
                className={inputStyles}
                name="dueMileage"
                type="number"
                min="0"
                step="1"
                placeholder={String(currentMileage + 10_000)}
              />
            </label>
          </div>
          {formError && (
            <p className={formErrorStyles} role="alert">
              {formError}
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

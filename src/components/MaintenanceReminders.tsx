import { useState, type FormEvent } from 'react'
import type {
  MaintenanceReminder,
  MaintenanceReminderInput,
} from '../types'
import {
  getMaintenanceReminderStatus,
  type MaintenanceReminderStatus,
} from '../lib/maintenanceReminders'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

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
    <section className="card reminders-card" aria-labelledby="reminders-title">
      <div className="section-heading reminders-heading">
        <div>
          <p className="eyebrow">Plan ahead</p>
          <h2 id="reminders-title">Maintenance reminders</h2>
        </div>
        <span className="record-count">
          {reminders.filter((reminder) => !reminder.completedAt).length} active
        </span>
      </div>

      <div className="reminders-layout">
        <form
          key={reminders.length}
          className="reminder-form"
          onSubmit={handleSubmit}
        >
          <label className="field">
            <span>Reminder</span>
            <input
              name="title"
              placeholder="e.g. Replace timing belt"
              maxLength={160}
              required
            />
          </label>
          <div className="form-grid form-grid-compact">
            <label className="field">
              <span>Due date</span>
              <input name="dueDate" type="date" />
            </label>
            <label className="field">
              <span>Due mileage (km)</span>
              <input
                name="dueMileage"
                type="number"
                min="0"
                step="1"
                placeholder={String(currentMileage + 10_000)}
              />
            </label>
          </div>
          {formError && (
            <p className="form-message form-message-error" role="alert">
              {formError}
            </p>
          )}
          <button className="button button-primary" type="submit">
            Add reminder
          </button>
        </form>

        {orderedReminders.length === 0 ? (
          <div className="reminders-empty">
            <p>No reminders yet.</p>
            <span>Add a date or mileage target for the next service.</span>
          </div>
        ) : (
          <ul className="reminder-list">
            {orderedReminders.map((reminder) => {
              const status = getMaintenanceReminderStatus(
                reminder,
                currentMileage,
              )

              return (
                <li
                  className={`reminder-item reminder-item-${status}`}
                  key={reminder.id}
                >
                  <div className="reminder-content">
                    <div className="reminder-title-row">
                      <h3>{reminder.title}</h3>
                      <span className={`reminder-status reminder-status-${status}`}>
                        {status === 'completed'
                          ? 'Completed'
                          : status === 'overdue'
                            ? 'Due now'
                            : 'Upcoming'}
                      </span>
                    </div>
                    <div className="record-meta">
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
                  <div className="record-actions reminder-actions">
                    <button
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
                      className="button-danger"
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

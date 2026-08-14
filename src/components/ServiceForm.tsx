import type { FormEvent } from 'react'
import type { ServiceRecord, ServiceRecordInput } from '../types'

interface ServiceFormProps {
  currentMileage: number
  record?: ServiceRecord
  onCancel: () => void
  onSave: (record: ServiceRecordInput) => void
}

const getLocalDate = (): string => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export const ServiceForm = ({
  currentMileage,
  record,
  onCancel,
  onSave,
}: ServiceFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const cost = Number(data.get('cost'))

    onSave({
      title: String(data.get('title')).trim(),
      category: String(data.get('category')) as ServiceRecordInput['category'],
      date: String(data.get('date')),
      mileage: Number(data.get('mileage')),
      workshop: String(data.get('workshop')).trim(),
      costInCents: Math.round(cost * 100),
      notes: String(data.get('notes')).trim(),
    })

  }

  return (
    <form className="card service-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{record ? 'Editing entry' : 'New entry'}</p>
          <h2>{record ? 'Edit service record' : 'Add service record'}</h2>
        </div>
      </div>

      <label className="field">
        <span>Service</span>
        <input
          name="title"
          defaultValue={record?.title}
          placeholder="e.g. Engine oil change"
          required
        />
      </label>

      <div className="form-grid form-grid-compact">
        <label className="field">
          <span>Category</span>
          <select name="category" defaultValue={record?.category ?? 'Maintenance'}>
            <option>Maintenance</option>
            <option>Repair</option>
            <option>Inspection</option>
            <option>Tires</option>
            <option>Other</option>
          </select>
        </label>

        <label className="field">
          <span>Date</span>
          <input
            name="date"
            type="date"
            defaultValue={record?.date ?? getLocalDate()}
            required
          />
        </label>

        <label className="field">
          <span>Mileage (km)</span>
          <input
            name="mileage"
            type="number"
            min="0"
            step="1"
            defaultValue={record?.mileage ?? currentMileage}
            required
          />
        </label>

        <label className="field">
          <span>Cost (PLN)</span>
          <input
            name="cost"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              record ? (record.costInCents / 100).toFixed(2) : undefined
            }
            placeholder="0.00"
            required
          />
        </label>
      </div>

      <label className="field">
        <span>Workshop</span>
        <input
          name="workshop"
          defaultValue={record?.workshop}
          placeholder="Optional"
        />
      </label>

      <label className="field">
        <span>Notes</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue={record?.notes}
          placeholder="Parts, observations, next steps..."
        />
      </label>

      <div className="service-form-actions">
        {record && (
          <button className="button button-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="button button-primary" type="submit">
          {record ? 'Save changes' : 'Save service record'}
        </button>
      </div>
    </form>
  )
}

import type { FormEvent } from 'react'
import type { ServiceRecordInput } from '../types'

interface ServiceFormProps {
  currentMileage: number
  onAdd: (record: ServiceRecordInput) => void
}

const getLocalDate = (): string => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export const ServiceForm = ({ currentMileage, onAdd }: ServiceFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const cost = Number(data.get('cost'))

    onAdd({
      title: String(data.get('title')).trim(),
      category: String(data.get('category')) as ServiceRecordInput['category'],
      date: String(data.get('date')),
      mileage: Number(data.get('mileage')),
      workshop: String(data.get('workshop')).trim(),
      costInCents: Math.round(cost * 100),
      notes: String(data.get('notes')).trim(),
    })

    form.reset()
  }

  return (
    <form className="card service-form" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">New entry</p>
          <h2>Add service record</h2>
        </div>
      </div>

      <label className="field">
        <span>Service</span>
        <input name="title" placeholder="e.g. Engine oil change" required />
      </label>

      <div className="form-grid form-grid-compact">
        <label className="field">
          <span>Category</span>
          <select name="category" defaultValue="Maintenance">
            <option>Maintenance</option>
            <option>Repair</option>
            <option>Inspection</option>
            <option>Tires</option>
            <option>Other</option>
          </select>
        </label>

        <label className="field">
          <span>Date</span>
          <input name="date" type="date" defaultValue={getLocalDate()} required />
        </label>

        <label className="field">
          <span>Mileage (km)</span>
          <input
            name="mileage"
            type="number"
            min="0"
            step="1"
            defaultValue={currentMileage}
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
            placeholder="0.00"
            required
          />
        </label>
      </div>

      <label className="field">
        <span>Workshop</span>
        <input name="workshop" placeholder="Optional" />
      </label>

      <label className="field">
        <span>Notes</span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Parts, observations, next steps..."
        />
      </label>

      <button className="button button-primary button-full" type="submit">
        Save service record
      </button>
    </form>
  )
}

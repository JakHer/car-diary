import type { FormEvent } from 'react'
import type { ServiceRecord, ServiceRecordInput } from '../types'
import { DatePicker } from './DatePicker'
import { SelectField } from './SelectField'
import {
  cardStyles,
  eyebrowStyles,
  fieldStyles,
  formGridStyles,
  inputStyles,
  joinClassNames,
  primaryButtonStyles,
  secondaryButtonStyles,
  sectionHeadingStyles,
  sectionTitleStyles,
  textareaStyles,
} from '../styles'

interface ServiceFormProps {
  currentMileage: number
  record?: ServiceRecord
  onCancel: () => void
  onSave: (record: ServiceRecordInput) => void
}

const serviceCategoryOptions: Array<{
  label: ServiceRecordInput['category']
  value: ServiceRecordInput['category']
}> = [
  { label: 'Maintenance', value: 'Maintenance' },
  { label: 'Repair', value: 'Repair' },
  { label: 'Inspection', value: 'Inspection' },
  { label: 'Tires', value: 'Tires' },
  { label: 'Other', value: 'Other' },
]

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
    <form
      className={joinClassNames(
        cardStyles,
        'sticky top-5 grid gap-5 p-7 max-[980px]:static max-[980px]:row-start-1 max-[700px]:p-[22px]',
      )}
      onSubmit={handleSubmit}
    >
      <div className={sectionHeadingStyles}>
        <div>
          <p className={eyebrowStyles}>
            {record ? 'Editing entry' : 'New entry'}
          </p>
          <h2 className={sectionTitleStyles}>
            {record ? 'Edit service record' : 'Add service record'}
          </h2>
        </div>
      </div>

      <label className={fieldStyles}>
        <span>Service</span>
        <input
          className={inputStyles}
          name="title"
          defaultValue={record?.title}
          placeholder="e.g. Engine oil change"
          required
        />
      </label>

      <div className={joinClassNames(formGridStyles, 'gap-4')}>
        <label className={fieldStyles}>
          <span>Category</span>
          <SelectField
            ariaLabel="Category"
            name="category"
            defaultValue={record?.category ?? 'Maintenance'}
            options={serviceCategoryOptions}
          />
        </label>

        <label className={fieldStyles}>
          <span>Date</span>
          <DatePicker
            name="date"
            defaultValue={record?.date ?? getLocalDate()}
            required
          />
        </label>

        <label className={fieldStyles}>
          <span>Mileage (km)</span>
          <input
            className={inputStyles}
            name="mileage"
            type="number"
            min="0"
            step="1"
            defaultValue={record?.mileage ?? currentMileage}
            required
          />
        </label>

        <label className={fieldStyles}>
          <span>Cost (PLN)</span>
          <input
            className={inputStyles}
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

      <label className={fieldStyles}>
        <span>Workshop</span>
        <input
          className={inputStyles}
          name="workshop"
          defaultValue={record?.workshop}
          placeholder="Optional"
        />
      </label>

      <label className={fieldStyles}>
        <span>Notes</span>
        <textarea
          className={textareaStyles}
          name="notes"
          rows={3}
          defaultValue={record?.notes}
          placeholder="Parts, observations, next steps..."
        />
      </label>

      <div className="flex gap-2.5">
        {record && (
          <button
            className={joinClassNames(secondaryButtonStyles, 'flex-1')}
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button
          className={joinClassNames(primaryButtonStyles, 'flex-1')}
          type="submit"
        >
          {record ? 'Save changes' : 'Save service record'}
        </button>
      </div>
    </form>
  )
}

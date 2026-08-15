import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ServiceRecord, ServiceRecordInput } from '../types'
import { DatePicker } from './DatePicker'
import { SelectField } from './SelectField'
import {
  serviceRecordSchema,
  type ServiceRecordFormValues,
} from '../lib/validation'
import {
  cardStyles,
  eyebrowStyles,
  fieldErrorStyles,
  fieldStyles,
  formGridStyles,
  inputStyles,
  invalidControlStyles,
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
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ServiceRecordFormValues>({
    resolver: zodResolver(serviceRecordSchema),
    defaultValues: {
      title: record?.title ?? '',
      category: record?.category ?? 'Maintenance',
      date: record?.date ?? getLocalDate(),
      mileage: record?.mileage ?? currentMileage,
      cost: record ? record.costInCents / 100 : undefined,
      workshop: record?.workshop ?? '',
      notes: record?.notes ?? '',
    },
    mode: 'onBlur',
  })

  const saveRecord = ({ cost, ...values }: ServiceRecordFormValues) => {
    onSave({
      ...values,
      costInCents: Math.round(cost * 100),
    })
  }

  return (
    <form
      className={joinClassNames(
        cardStyles,
        'sticky top-5 grid gap-5 p-7 max-[980px]:static max-[980px]:row-start-1 max-[700px]:p-[22px]',
      )}
      noValidate
      onSubmit={handleSubmit(saveRecord)}
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
          className={joinClassNames(
            inputStyles,
            errors.title && invalidControlStyles,
          )}
          placeholder="e.g. Engine oil change"
          aria-label="Service"
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
          <span>Category</span>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <SelectField
                ariaLabel="Category"
                invalid={Boolean(errors.category)}
                name={field.name}
                options={serviceCategoryOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          {errors.category && (
            <p className={fieldErrorStyles} role="alert">
              {errors.category.message}
            </p>
          )}
        </label>

        <label className={fieldStyles}>
          <span>Date</span>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <DatePicker
                invalid={Boolean(errors.date)}
                name={field.name}
                required
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          {errors.date && (
            <p className={fieldErrorStyles} role="alert">
              {errors.date.message}
            </p>
          )}
        </label>

        <label className={fieldStyles}>
          <span>Mileage (km)</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.mileage && invalidControlStyles,
            )}
            type="number"
            min="0"
            step="1"
            aria-label="Mileage (km)"
            aria-invalid={Boolean(errors.mileage)}
            {...register('mileage', { valueAsNumber: true })}
          />
          {errors.mileage && (
            <p className={fieldErrorStyles} role="alert">
              {errors.mileage.message}
            </p>
          )}
        </label>

        <label className={fieldStyles}>
          <span>Cost (PLN)</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.cost && invalidControlStyles,
            )}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            aria-label="Cost (PLN)"
            aria-invalid={Boolean(errors.cost)}
            {...register('cost', { valueAsNumber: true })}
          />
          {errors.cost && (
            <p className={fieldErrorStyles} role="alert">
              {errors.cost.message}
            </p>
          )}
        </label>
      </div>

      <label className={fieldStyles}>
        <span>Workshop</span>
        <input
          className={joinClassNames(
            inputStyles,
            errors.workshop && invalidControlStyles,
          )}
          placeholder="Optional"
          aria-label="Workshop"
          aria-invalid={Boolean(errors.workshop)}
          {...register('workshop')}
        />
        {errors.workshop && (
          <p className={fieldErrorStyles} role="alert">
            {errors.workshop.message}
          </p>
        )}
      </label>

      <label className={fieldStyles}>
        <span>Notes</span>
        <textarea
          className={joinClassNames(
            textareaStyles,
            errors.notes && invalidControlStyles,
          )}
          rows={3}
          placeholder="Parts, observations, next steps..."
          aria-label="Notes"
          aria-invalid={Boolean(errors.notes)}
          {...register('notes')}
        />
        {errors.notes && (
          <p className={fieldErrorStyles} role="alert">
            {errors.notes.message}
          </p>
        )}
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

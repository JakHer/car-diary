import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ServiceRecord, ServiceRecordInput } from '../types'
import { DatePicker } from './DatePicker'
import { useTranslatedFormErrors } from '../hooks/useTranslatedFormErrors'
import { FieldError } from './FieldError'
import { Loader } from './Loader'
import { SelectField } from './SelectField'
import {
  createServiceRecordSchema,
  type ServiceRecordFormValues,
} from '../lib/validation'
import {
  cardStyles,
  eyebrowStyles,
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
  isSaving: boolean
  record?: ServiceRecord
  onCancel: () => void
  onSave: (record: ServiceRecordInput) => void
}

const serviceCategories: ServiceRecordInput['category'][] = [
  'Maintenance',
  'Repair',
  'Inspection',
  'Tires',
  'Other',
]

const getLocalDate = (): string => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export const ServiceForm = ({
  currentMileage,
  isSaving,
  record,
  onCancel,
  onSave,
}: ServiceFormProps) => {
  const { i18n, t } = useTranslation()
  const schema = useMemo(
    () => createServiceRecordSchema(t),
    [t],
  )
  const serviceCategoryOptions = serviceCategories.map((category) => ({
    label: t(`service.categories.${category}`),
    value: category,
  }))
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    trigger,
  } = useForm<ServiceRecordFormValues>({
    resolver: zodResolver(schema),
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
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)

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
      aria-busy={isSaving}
      noValidate
      onSubmit={handleSubmit(saveRecord)}
    >
      <div className={sectionHeadingStyles}>
        <div>
          <p className={eyebrowStyles}>
            {record ? t('service.editingEyebrow') : t('service.newEyebrow')}
          </p>
          <h2 className={sectionTitleStyles}>
            {record ? t('service.editTitle') : t('service.addTitle')}
          </h2>
        </div>
      </div>

      <label className={fieldStyles}>
        <span>{t('service.name')}</span>
        <input
          className={joinClassNames(
            inputStyles,
            errors.title && invalidControlStyles,
          )}
          placeholder={t('service.namePlaceholder')}
          aria-label={t('service.name')}
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
        <FieldError message={errors.title?.message} />
      </label>

      <div className={joinClassNames(formGridStyles, 'gap-4')}>
        <label className={fieldStyles}>
          <span>{t('service.category')}</span>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <SelectField
                ariaLabel={t('service.category')}
                invalid={Boolean(errors.category)}
                name={field.name}
                options={serviceCategoryOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldError message={errors.category?.message} />
        </label>

        <label className={fieldStyles}>
          <span>{t('service.date')}</span>
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
          <FieldError message={errors.date?.message} />
        </label>

        <label className={fieldStyles}>
          <span>{t('service.mileage')}</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.mileage && invalidControlStyles,
            )}
            type="number"
            min="0"
            step="1"
            aria-label={t('service.mileage')}
            aria-invalid={Boolean(errors.mileage)}
            {...register('mileage', { valueAsNumber: true })}
          />
          <FieldError message={errors.mileage?.message} />
        </label>

        <label className={fieldStyles}>
          <span>{t('service.cost')}</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.cost && invalidControlStyles,
            )}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            aria-label={t('service.cost')}
            aria-invalid={Boolean(errors.cost)}
            {...register('cost', { valueAsNumber: true })}
          />
          <FieldError message={errors.cost?.message} />
        </label>
      </div>

      <label className={fieldStyles}>
        <span>{t('service.workshop')}</span>
        <input
          className={joinClassNames(
            inputStyles,
            errors.workshop && invalidControlStyles,
          )}
          placeholder={t('common.optional')}
          aria-label={t('service.workshop')}
          aria-invalid={Boolean(errors.workshop)}
          {...register('workshop')}
        />
        <FieldError message={errors.workshop?.message} />
      </label>

      <label className={fieldStyles}>
        <span>{t('service.notes')}</span>
        <textarea
          className={joinClassNames(
            textareaStyles,
            errors.notes && invalidControlStyles,
          )}
          rows={3}
          placeholder={t('service.notesPlaceholder')}
          aria-label={t('service.notes')}
          aria-invalid={Boolean(errors.notes)}
          {...register('notes')}
        />
        <FieldError message={errors.notes?.message} />
      </label>

      <div className="flex gap-2.5">
        {record && (
          <button
            className={joinClassNames(secondaryButtonStyles, 'flex-1')}
            type="button"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </button>
        )}
        <button
          className={joinClassNames(primaryButtonStyles, 'flex-1')}
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader label={t('service.saving')} size="small" />
          ) : record ? (
            t('service.saveChanges')
          ) : (
            t('service.save')
          )}
        </button>
      </div>
    </form>
  )
}

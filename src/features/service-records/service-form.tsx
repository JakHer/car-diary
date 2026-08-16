import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  DistanceUnit,
  ServiceRecord,
  ServiceRecordInput,
} from '@/types'
import { DatePicker } from '@/components/forms/date-picker'
import { useTranslatedFormErrors } from '@/hooks/use-translated-form-errors'
import { FieldError } from '@/components/forms/field-error'
import { Loader } from '@/components/feedback/loader'
import { SelectField } from '@/components/forms/select-field'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  createServiceRecordSchema,
  type ServiceRecordFormValues,
} from '@/lib/validation'

interface ServiceFormProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  embedded?: boolean
  isSaving: boolean
  record?: ServiceRecord
  onCancel: () => void
  onSave: (record: ServiceRecordInput) => Promise<void>
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
  distanceUnit,
  embedded = false,
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

  const saveRecord = async ({ cost, ...values }: ServiceRecordFormValues) => {
    await onSave({
      ...values,
      costInCents: Math.round(cost * 100),
    })
  }

  return (
    <form
      className={cn(
        !embedded &&
          'rounded-large border border-border bg-surface shadow-card',
        embedded
          ? 'grid gap-5'
          : 'sticky top-5 grid gap-5 p-7 max-[980px]:static max-[980px]:row-start-1 max-[700px]:p-[22px]',
      )}
      aria-busy={isSaving}
      noValidate
      onSubmit={handleSubmit(saveRecord)}
    >
      {!embedded && (
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
              {record ? t('service.editingEyebrow') : t('service.newEyebrow')}
            </p>
            <h2 className="m-0 text-[22px] font-bold tracking-[-0.025em] text-strong">
              {record ? t('service.editTitle') : t('service.addTitle')}
            </h2>
          </div>
        </div>
      )}

      <Field>
        <span>{t('service.name')}</span>
        <Input
          placeholder={t('service.namePlaceholder')}
          aria-label={t('service.name')}
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
        <FieldError message={errors.title?.message} />
      </Field>

      <FieldGroup className="gap-4">
        <Field>
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
        </Field>

        <Field>
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
        </Field>

        <Field>
          <span>{t('service.mileage', { unit: distanceUnit })}</span>
          <Input
            type="number"
            min="0"
            step="1"
            aria-label={t('service.mileage', { unit: distanceUnit })}
            aria-invalid={Boolean(errors.mileage)}
            {...register('mileage', { valueAsNumber: true })}
          />
          <FieldError message={errors.mileage?.message} />
        </Field>

        <Field>
          <span>{t('service.cost')}</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            aria-label={t('service.cost')}
            aria-invalid={Boolean(errors.cost)}
            {...register('cost', { valueAsNumber: true })}
          />
          <FieldError message={errors.cost?.message} />
        </Field>
      </FieldGroup>

      <Field>
        <span>{t('service.workshop')}</span>
        <Input
          placeholder={t('common.optional')}
          aria-label={t('service.workshop')}
          aria-invalid={Boolean(errors.workshop)}
          {...register('workshop')}
        />
        <FieldError message={errors.workshop?.message} />
      </Field>

      <Field>
        <span>{t('service.notes')}</span>
        <Textarea
          rows={3}
          placeholder={t('service.notesPlaceholder')}
          aria-label={t('service.notes')}
          aria-invalid={Boolean(errors.notes)}
          {...register('notes')}
        />
        <FieldError message={errors.notes?.message} />
      </Field>

      <div className="flex gap-2.5">
        {(record || embedded) && (
          <Button
            className="flex-1"
            variant="secondary"
            type="button"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </Button>
        )}
        <Button
          className="flex-1"
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
        </Button>
      </div>
    </form>
  )
}

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DistanceUnit, FuelEntryInput } from '@/types'
import {
  createFuelEntrySchema,
  type FuelEntryFormValues,
} from '@/lib/validation'
import { useTranslatedFormErrors } from '@/hooks/use-translated-form-errors'
import { DatePicker } from '@/components/forms/date-picker'
import { FieldError } from '@/components/forms/field-error'
import { Loader } from '@/components/feedback/loader'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface FuelEntryFormProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  isSaving: boolean
  onCreate: (input: FuelEntryInput) => Promise<void>
  onCreated: () => void
}

const getLocalDate = (): string => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export const FuelEntryForm = ({
  currentMileage,
  distanceUnit,
  isSaving,
  onCreate,
  onCreated,
}: FuelEntryFormProps) => {
  const { i18n, t } = useTranslation()
  const schema = useMemo(() => createFuelEntrySchema(t), [t])
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
  } = useForm<FuelEntryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: getLocalDate(),
      mileage: currentMileage,
      liters: undefined,
      totalCost: undefined,
      station: '',
      fullTank: false,
    },
    mode: 'onBlur',
  })
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)

  const createEntry = async ({
    liters,
    totalCost,
    ...values
  }: FuelEntryFormValues) => {
    try {
      await onCreate({
        ...values,
        volumeInMilliliters: Math.round(liters * 1_000),
        totalCostInCents: Math.round(totalCost * 100),
      })
    } catch {
      return
    }

    reset({
      date: getLocalDate(),
      mileage: Math.max(currentMileage, values.mileage),
      station: '',
      fullTank: false,
    })
    setValue('liters', Number.NaN)
    setValue('totalCost', Number.NaN)
    onCreated()
  }

  return (
    <form
      className="grid gap-4"
      aria-busy={isSaving}
      noValidate
      onSubmit={handleSubmit(createEntry)}
    >
      <FieldGroup className="gap-4">
        <Field>
          <span>{t('fuel.date')}</span>
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
          <span>{t('fuel.mileage', { unit: distanceUnit })}</span>
          <Input
            type="number"
            min="0"
            step="1"
            aria-label={t('fuel.mileage', { unit: distanceUnit })}
            aria-invalid={Boolean(errors.mileage)}
            {...register('mileage', { valueAsNumber: true })}
          />
          <FieldError message={errors.mileage?.message} />
        </Field>
        <Field>
          <span>{t('fuel.volume')}</span>
          <Input
            type="number"
            min="0.001"
            max="500"
            step="0.001"
            placeholder="0.000"
            aria-label={t('fuel.volume')}
            aria-invalid={Boolean(errors.liters)}
            {...register('liters', { valueAsNumber: true })}
          />
          <FieldError message={errors.liters?.message} />
        </Field>
        <Field>
          <span>{t('fuel.totalCost')}</span>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            aria-label={t('fuel.totalCost')}
            aria-invalid={Boolean(errors.totalCost)}
            {...register('totalCost', { valueAsNumber: true })}
          />
          <FieldError message={errors.totalCost?.message} />
        </Field>
      </FieldGroup>
      <Field>
        <span>{t('fuel.station')}</span>
        <Input
          placeholder={t('fuel.stationPlaceholder')}
          aria-label={t('fuel.station')}
          aria-invalid={Boolean(errors.station)}
          {...register('station')}
        />
        <FieldError message={errors.station?.message} />
      </Field>
      <label className="flex min-h-10 cursor-pointer items-center gap-3 text-[13px] font-semibold text-strong">
        <input
          className="size-4 accent-accent"
          type="checkbox"
          {...register('fullTank')}
        />
        <span>{t('fuel.fullTank')}</span>
      </label>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <Loader label={t('fuel.adding')} size="small" />
        ) : (
          t('fuel.add')
        )}
      </Button>
    </form>
  )
}

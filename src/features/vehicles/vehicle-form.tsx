import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DistanceUnit, Vehicle, VehicleInput } from '@/types'
import { FieldError } from '@/components/forms/field-error'
import { useTranslatedFormErrors } from '@/hooks/use-translated-form-errors'
import { Loader } from '@/components/feedback/loader'
import { SelectField } from '@/components/forms/select-field'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  createVehicleSchema,
  type VehicleFormValues,
} from '@/lib/validation'

interface VehicleFormProps {
  className?: string
  defaultDistanceUnit?: DistanceUnit
  isSaving: boolean
  vehicle?: Vehicle
  onCancel?: () => void
  onSave: (vehicle: VehicleInput) => void
}

export const VehicleForm = ({
  className,
  defaultDistanceUnit = 'km',
  isSaving,
  vehicle,
  onCancel,
  onSave,
}: VehicleFormProps) => {
  const { i18n, t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const isEditing = Boolean(vehicle)
  const initialDistanceUnit = vehicle?.distanceUnit ?? defaultDistanceUnit
  const schema = useMemo(
    () =>
      createVehicleSchema(
        vehicle?.currentMileage ?? 0,
        initialDistanceUnit,
        t,
      ),
    [initialDistanceUnit, t, vehicle?.currentMileage],
  )
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    trigger,
    watch,
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      year: vehicle?.year,
      distanceUnit: initialDistanceUnit,
      currentMileage: vehicle?.currentMileage,
      registrationNumber: vehicle?.registrationNumber ?? '',
      vin: vehicle?.vin ?? '',
    },
    mode: 'onBlur',
  })
  const selectedDistanceUnit = watch('distanceUnit')
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)

  const saveVehicle = (values: VehicleFormValues) => onSave(values)

  return (
    <form
      className={cn(
        'rounded-large border border-border bg-surface shadow-card',
        'p-[clamp(24px,4vw,36px)] max-[700px]:p-[22px]',
        className,
      )}
      aria-busy={isSaving}
      noValidate
      onSubmit={handleSubmit(saveVehicle)}
    >
      <div className="mb-8 flex items-start gap-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-accent-soft text-xs font-extrabold text-accent">
          {isEditing ? 'ED' : '01'}
        </span>
        <div>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.025em] text-strong">
            {isEditing ? t('vehicle.editTitle') : t('vehicle.addTitle')}
          </h2>
          <p className="mt-1.5 mb-0 text-sm text-muted">
            {isEditing
              ? t('vehicle.editDescription')
              : t('vehicle.addDescription')}
          </p>
        </div>
      </div>

      <FieldGroup>
        <Field>
          <span>{t('vehicle.make')}</span>
          <Input
            placeholder={t('vehicle.makePlaceholder')}
            autoFocus
            aria-label={t('vehicle.make')}
            aria-invalid={Boolean(errors.make)}
            {...register('make')}
          />
          <FieldError message={errors.make?.message} />
        </Field>

        <Field>
          <span>{t('vehicle.model')}</span>
          <Input
            placeholder={t('vehicle.modelPlaceholder')}
            aria-label={t('vehicle.model')}
            aria-invalid={Boolean(errors.model)}
            {...register('model')}
          />
          <FieldError message={errors.model?.message} />
        </Field>

        <Field>
          <span>{t('vehicle.year')}</span>
          <Input
            type="number"
            min="1886"
            max={currentYear + 1}
            placeholder={String(currentYear)}
            aria-label={t('vehicle.year')}
            aria-invalid={Boolean(errors.year)}
            {...register('year', { valueAsNumber: true })}
          />
          <FieldError message={errors.year?.message} />
        </Field>

        <Field>
          <span>{t('vehicle.distanceUnit')}</span>
          <Controller
            control={control}
            name="distanceUnit"
            render={({ field }) => (
              <SelectField
                ariaLabel={t('vehicle.distanceUnit')}
                disabled={isEditing}
                invalid={Boolean(errors.distanceUnit)}
                name={field.name}
                options={[
                  { label: t('vehicle.kilometers'), value: 'km' },
                  { label: t('vehicle.miles'), value: 'mi' },
                ]}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <span
            className={cn(
              'block min-h-[17px] text-xs font-semibold leading-[1.4] text-muted',
              !isEditing && 'invisible',
            )}
            aria-hidden={!isEditing}
          >
            {isEditing ? t('vehicle.distanceUnitLocked') : '\u00a0'}
          </span>
        </Field>

        <Field>
          <span>
            {t('vehicle.currentMileage', { unit: selectedDistanceUnit })}
          </span>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="125000"
            aria-label={t('vehicle.currentMileage', {
              unit: selectedDistanceUnit,
            })}
            aria-invalid={Boolean(errors.currentMileage)}
            {...register('currentMileage', { valueAsNumber: true })}
          />
          <FieldError message={errors.currentMileage?.message} />
        </Field>

        <Field>
          <span>{t('vehicle.registrationNumber')}</span>
          <Input
            placeholder={t('common.optional')}
            aria-label={t('vehicle.registrationNumber')}
            aria-invalid={Boolean(errors.registrationNumber)}
            {...register('registrationNumber')}
          />
          <FieldError message={errors.registrationNumber?.message} />
        </Field>

        <Field>
          <span>{t('vehicle.vin')}</span>
          <Input
            maxLength={17}
            placeholder={t('common.optional')}
            aria-label={t('vehicle.vin')}
            aria-invalid={Boolean(errors.vin)}
            {...register('vin')}
          />
          <FieldError message={errors.vin?.message} />
        </Field>
      </FieldGroup>

      <div className="mt-7 flex items-center justify-between gap-5 border-t border-border pt-6 max-[700px]:flex-col max-[700px]:items-start">
        <p className="m-0 text-xs text-muted">
          {isEditing
              ? t('vehicle.serviceRecordsUnchanged')
              : t('vehicle.dataStored')}
        </p>
        <div className="flex gap-2.5 max-[700px]:w-full max-[700px]:flex-col">
          {onCancel && (
            <Button
              className="max-[700px]:w-full"
              variant="secondary"
              type="button"
              disabled={isSaving}
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
          )}
          <Button
            className="max-[700px]:w-full"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader label={t('vehicle.saving')} size="small" />
            ) : isEditing ? (
              t('vehicle.save')
            ) : (
              t('vehicle.create')
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

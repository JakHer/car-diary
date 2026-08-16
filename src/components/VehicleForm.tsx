import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Vehicle, VehicleInput } from '../types'
import { FieldError } from './FieldError'
import { useTranslatedFormErrors } from '../hooks/useTranslatedFormErrors'
import { Loader } from './Loader'
import {
  createVehicleSchema,
  type VehicleFormValues,
} from '../lib/validation'
import {
  cardStyles,
  fieldStyles,
  formGridStyles,
  inputStyles,
  invalidControlStyles,
  joinClassNames,
  primaryButtonStyles,
  secondaryButtonStyles,
} from '../styles'

interface VehicleFormProps {
  className?: string
  isSaving: boolean
  vehicle?: Vehicle
  onCancel?: () => void
  onSave: (vehicle: VehicleInput) => void
}

export const VehicleForm = ({
  className,
  isSaving,
  vehicle,
  onCancel,
  onSave,
}: VehicleFormProps) => {
  const { i18n, t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const isEditing = Boolean(vehicle)
  const schema = useMemo(
    () => createVehicleSchema(vehicle?.currentMileage ?? 0, t),
    [t, vehicle?.currentMileage],
  )
  const {
    formState: { errors },
    handleSubmit,
    register,
    trigger,
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      year: vehicle?.year,
      currentMileage: vehicle?.currentMileage,
      registrationNumber: vehicle?.registrationNumber ?? '',
      vin: vehicle?.vin ?? '',
    },
    mode: 'onBlur',
  })
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)

  const saveVehicle = (values: VehicleFormValues) => onSave(values)

  return (
    <form
      className={joinClassNames(
        cardStyles,
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

      <div className={formGridStyles}>
        <label className={fieldStyles}>
          <span>{t('vehicle.make')}</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.make && invalidControlStyles,
            )}
            placeholder={t('vehicle.makePlaceholder')}
            autoFocus
            aria-label={t('vehicle.make')}
            aria-invalid={Boolean(errors.make)}
            {...register('make')}
          />
          <FieldError message={errors.make?.message} />
        </label>

        <label className={fieldStyles}>
          <span>{t('vehicle.model')}</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.model && invalidControlStyles,
            )}
            placeholder={t('vehicle.modelPlaceholder')}
            aria-label={t('vehicle.model')}
            aria-invalid={Boolean(errors.model)}
            {...register('model')}
          />
          <FieldError message={errors.model?.message} />
        </label>

        <label className={fieldStyles}>
          <span>{t('vehicle.year')}</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.year && invalidControlStyles,
            )}
            type="number"
            min="1886"
            max={currentYear + 1}
            placeholder={String(currentYear)}
            aria-label={t('vehicle.year')}
            aria-invalid={Boolean(errors.year)}
            {...register('year', { valueAsNumber: true })}
          />
          <FieldError message={errors.year?.message} />
        </label>

        <label className={fieldStyles}>
          <span>{t('vehicle.currentMileage')}</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.currentMileage && invalidControlStyles,
            )}
            type="number"
            min="0"
            step="1"
            placeholder="125000"
            aria-label={t('vehicle.currentMileage')}
            aria-invalid={Boolean(errors.currentMileage)}
            {...register('currentMileage', { valueAsNumber: true })}
          />
          <FieldError message={errors.currentMileage?.message} />
        </label>

        <label className={fieldStyles}>
          <span>{t('vehicle.registrationNumber')}</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.registrationNumber && invalidControlStyles,
            )}
            placeholder={t('common.optional')}
            aria-label={t('vehicle.registrationNumber')}
            aria-invalid={Boolean(errors.registrationNumber)}
            {...register('registrationNumber')}
          />
          <FieldError message={errors.registrationNumber?.message} />
        </label>

        <label className={fieldStyles}>
          <span>{t('vehicle.vin')}</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.vin && invalidControlStyles,
            )}
            maxLength={17}
            placeholder={t('common.optional')}
            aria-label={t('vehicle.vin')}
            aria-invalid={Boolean(errors.vin)}
            {...register('vin')}
          />
          <FieldError message={errors.vin?.message} />
        </label>
      </div>

      <div className="mt-7 flex items-center justify-between gap-5 border-t border-border pt-6 max-[700px]:flex-col max-[700px]:items-start">
        <p className="m-0 text-xs text-muted">
          {isEditing
              ? t('vehicle.serviceRecordsUnchanged')
              : t('vehicle.dataStored')}
        </p>
        <div className="flex gap-2.5 max-[700px]:w-full max-[700px]:flex-col">
          {onCancel && (
            <button
              className={joinClassNames(
                secondaryButtonStyles,
                'max-[700px]:w-full',
              )}
              type="button"
              disabled={isSaving}
              onClick={onCancel}
            >
              {t('common.cancel')}
            </button>
          )}
          <button
            className={joinClassNames(
              primaryButtonStyles,
              'max-[700px]:w-full',
            )}
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
          </button>
        </div>
      </div>
    </form>
  )
}

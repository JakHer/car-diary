import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Vehicle, VehicleInput } from '../types'
import { FieldError } from './FieldError'
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
  const currentYear = new Date().getFullYear()
  const isEditing = Boolean(vehicle)
  const schema = useMemo(
    () => createVehicleSchema(vehicle?.currentMileage ?? 0),
    [vehicle?.currentMileage],
  )
  const {
    formState: { errors },
    handleSubmit,
    register,
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
            {isEditing ? 'Edit vehicle' : 'Add your vehicle'}
          </h2>
          <p className="mt-1.5 mb-0 text-sm text-muted">
            {isEditing
              ? 'Update the profile details and current mileage.'
              : 'Start with the details you use most often.'}
          </p>
        </div>
      </div>

      <div className={formGridStyles}>
        <label className={fieldStyles}>
          <span>Make</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.make && invalidControlStyles,
            )}
            placeholder="e.g. Volvo"
            autoFocus
            aria-label="Make"
            aria-invalid={Boolean(errors.make)}
            {...register('make')}
          />
          <FieldError message={errors.make?.message} />
        </label>

        <label className={fieldStyles}>
          <span>Model</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.model && invalidControlStyles,
            )}
            placeholder="e.g. V60"
            aria-label="Model"
            aria-invalid={Boolean(errors.model)}
            {...register('model')}
          />
          <FieldError message={errors.model?.message} />
        </label>

        <label className={fieldStyles}>
          <span>Year</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.year && invalidControlStyles,
            )}
            type="number"
            min="1886"
            max={currentYear + 1}
            placeholder={String(currentYear)}
            aria-label="Year"
            aria-invalid={Boolean(errors.year)}
            {...register('year', { valueAsNumber: true })}
          />
          <FieldError message={errors.year?.message} />
        </label>

        <label className={fieldStyles}>
          <span>Current mileage (km)</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.currentMileage && invalidControlStyles,
            )}
            type="number"
            min="0"
            step="1"
            placeholder="125000"
            aria-label="Current mileage (km)"
            aria-invalid={Boolean(errors.currentMileage)}
            {...register('currentMileage', { valueAsNumber: true })}
          />
          <FieldError message={errors.currentMileage?.message} />
        </label>

        <label className={fieldStyles}>
          <span>Registration number</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.registrationNumber && invalidControlStyles,
            )}
            placeholder="Optional"
            aria-label="Registration number"
            aria-invalid={Boolean(errors.registrationNumber)}
            {...register('registrationNumber')}
          />
          <FieldError message={errors.registrationNumber?.message} />
        </label>

        <label className={fieldStyles}>
          <span>VIN</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.vin && invalidControlStyles,
            )}
            maxLength={17}
            placeholder="Optional"
            aria-label="VIN"
            aria-invalid={Boolean(errors.vin)}
            {...register('vin')}
          />
          <FieldError message={errors.vin?.message} />
        </label>
      </div>

      <div className="mt-7 flex items-center justify-between gap-5 border-t border-border pt-6 max-[700px]:flex-col max-[700px]:items-start">
        <p className="m-0 text-xs text-muted">
          {isEditing
            ? 'Service records will not be changed.'
            : 'Your data stays in this browser.'}
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
              Cancel
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
              <Loader label="Saving vehicle..." size="small" />
            ) : isEditing ? (
              'Save vehicle'
            ) : (
              'Create vehicle profile'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

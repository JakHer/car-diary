import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Vehicle, VehicleInput } from '../types'
import {
  vehicleSchema,
  type VehicleFormValues,
} from '../lib/validation'
import {
  cardStyles,
  fieldErrorStyles,
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
  vehicle?: Vehicle
  onCancel?: () => void
  onSave: (vehicle: VehicleInput) => void
}

export const VehicleForm = ({
  className,
  vehicle,
  onCancel,
  onSave,
}: VehicleFormProps) => {
  const currentYear = new Date().getFullYear()
  const isEditing = Boolean(vehicle)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: vehicle?.make ?? '',
      model: vehicle?.model ?? '',
      year: vehicle?.year,
      currentMileage: vehicle?.startingMileage,
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
              ? 'Update the profile details and starting mileage.'
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
          {errors.make && (
            <p className={fieldErrorStyles} role="alert">
              {errors.make.message}
            </p>
          )}
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
          {errors.model && (
            <p className={fieldErrorStyles} role="alert">
              {errors.model.message}
            </p>
          )}
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
          {errors.year && (
            <p className={fieldErrorStyles} role="alert">
              {errors.year.message}
            </p>
          )}
        </label>

        <label className={fieldStyles}>
          <span>{isEditing ? 'Starting mileage (km)' : 'Current mileage (km)'}</span>
          <input
            className={joinClassNames(
              inputStyles,
              errors.currentMileage && invalidControlStyles,
            )}
            type="number"
            min="0"
            step="1"
            placeholder="125000"
            aria-label={
              isEditing ? 'Starting mileage (km)' : 'Current mileage (km)'
            }
            aria-invalid={Boolean(errors.currentMileage)}
            {...register('currentMileage', { valueAsNumber: true })}
          />
          {errors.currentMileage && (
            <p className={fieldErrorStyles} role="alert">
              {errors.currentMileage.message}
            </p>
          )}
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
          {errors.registrationNumber && (
            <p className={fieldErrorStyles} role="alert">
              {errors.registrationNumber.message}
            </p>
          )}
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
          {errors.vin && (
            <p className={fieldErrorStyles} role="alert">
              {errors.vin.message}
            </p>
          )}
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
          >
            {isEditing ? 'Save vehicle' : 'Create vehicle profile'}
          </button>
        </div>
      </div>
    </form>
  )
}

import type { FormEvent } from 'react'
import type { Vehicle, VehicleInput } from '../types'
import {
  cardStyles,
  fieldStyles,
  formGridStyles,
  inputStyles,
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    onSave({
      make: String(data.get('make')).trim(),
      model: String(data.get('model')).trim(),
      year: Number(data.get('year')),
      registrationNumber: String(data.get('registrationNumber')).trim(),
      vin: String(data.get('vin')).trim().toUpperCase(),
      currentMileage: Number(data.get('currentMileage')),
    })
  }

  return (
    <form
      className={joinClassNames(
        cardStyles,
        'p-[clamp(24px,4vw,36px)] max-[700px]:p-[22px]',
        className,
      )}
      onSubmit={handleSubmit}
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
            className={inputStyles}
            name="make"
            defaultValue={vehicle?.make}
            placeholder="e.g. Volvo"
            required
            autoFocus
          />
        </label>

        <label className={fieldStyles}>
          <span>Model</span>
          <input
            className={inputStyles}
            name="model"
            defaultValue={vehicle?.model}
            placeholder="e.g. V60"
            required
          />
        </label>

        <label className={fieldStyles}>
          <span>Year</span>
          <input
            className={inputStyles}
            name="year"
            type="number"
            min="1886"
            max={currentYear + 1}
            defaultValue={vehicle?.year}
            placeholder={String(currentYear)}
            required
          />
        </label>

        <label className={fieldStyles}>
          <span>{isEditing ? 'Starting mileage (km)' : 'Current mileage (km)'}</span>
          <input
            className={inputStyles}
            name="currentMileage"
            type="number"
            min="0"
            step="1"
            defaultValue={vehicle?.startingMileage}
            placeholder="125000"
            required
          />
        </label>

        <label className={fieldStyles}>
          <span>Registration number</span>
          <input
            className={inputStyles}
            name="registrationNumber"
            defaultValue={vehicle?.registrationNumber}
            placeholder="Optional"
          />
        </label>

        <label className={fieldStyles}>
          <span>VIN</span>
          <input
            className={inputStyles}
            name="vin"
            minLength={17}
            maxLength={17}
            defaultValue={vehicle?.vin}
            placeholder="Optional"
          />
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

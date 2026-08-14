import type { FormEvent } from 'react'
import type { Vehicle, VehicleInput } from '../types'

interface VehicleFormProps {
  vehicle?: Vehicle
  onCancel?: () => void
  onSave: (vehicle: VehicleInput) => void
}

export const VehicleForm = ({
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
    <form className="card setup-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <span className="step-number">{isEditing ? 'ED' : '01'}</span>
        <div>
          <h2>{isEditing ? 'Edit vehicle' : 'Add your vehicle'}</h2>
          <p>
            {isEditing
              ? 'Update the profile details and starting mileage.'
              : 'Start with the details you use most often.'}
          </p>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Make</span>
          <input
            name="make"
            defaultValue={vehicle?.make}
            placeholder="e.g. Volvo"
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span>Model</span>
          <input
            name="model"
            defaultValue={vehicle?.model}
            placeholder="e.g. V60"
            required
          />
        </label>

        <label className="field">
          <span>Year</span>
          <input
            name="year"
            type="number"
            min="1886"
            max={currentYear + 1}
            defaultValue={vehicle?.year}
            placeholder={String(currentYear)}
            required
          />
        </label>

        <label className="field">
          <span>{isEditing ? 'Starting mileage (km)' : 'Current mileage (km)'}</span>
          <input
            name="currentMileage"
            type="number"
            min="0"
            step="1"
            defaultValue={vehicle?.startingMileage}
            placeholder="125000"
            required
          />
        </label>

        <label className="field">
          <span>Registration number</span>
          <input
            name="registrationNumber"
            defaultValue={vehicle?.registrationNumber}
            placeholder="Optional"
          />
        </label>

        <label className="field">
          <span>VIN</span>
          <input
            name="vin"
            minLength={17}
            maxLength={17}
            defaultValue={vehicle?.vin}
            placeholder="Optional"
          />
        </label>
      </div>

      <div className="form-actions">
        <p>
          {isEditing
            ? 'Service records will not be changed.'
            : 'Your data stays in this browser.'}
        </p>
        <div className="form-action-buttons">
          {onCancel && (
            <button
              className="button button-secondary"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button className="button button-primary" type="submit">
            {isEditing ? 'Save vehicle' : 'Create vehicle profile'}
          </button>
        </div>
      </div>
    </form>
  )
}

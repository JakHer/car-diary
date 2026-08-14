import type { FormEvent } from 'react'
import type { VehicleInput } from '../types'

interface VehicleSetupProps {
  onSave: (vehicle: VehicleInput) => void
}

export const VehicleSetup = ({ onSave }: VehicleSetupProps) => {
  const currentYear = new Date().getFullYear()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

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
        <span className="step-number">01</span>
        <div>
          <h2>Add your vehicle</h2>
          <p>Start with the details you use most often.</p>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Make</span>
          <input name="make" placeholder="e.g. Volvo" required autoFocus />
        </label>

        <label className="field">
          <span>Model</span>
          <input name="model" placeholder="e.g. V60" required />
        </label>

        <label className="field">
          <span>Year</span>
          <input
            name="year"
            type="number"
            min="1886"
            max={currentYear + 1}
            placeholder={String(currentYear)}
            required
          />
        </label>

        <label className="field">
          <span>Current mileage (km)</span>
          <input
            name="currentMileage"
            type="number"
            min="0"
            step="1"
            placeholder="125000"
            required
          />
        </label>

        <label className="field">
          <span>Registration number</span>
          <input name="registrationNumber" placeholder="Optional" />
        </label>

        <label className="field">
          <span>VIN</span>
          <input
            name="vin"
            minLength={17}
            maxLength={17}
            placeholder="Optional"
          />
        </label>
      </div>

      <div className="form-actions">
        <p>Your data stays in this browser.</p>
        <button className="button button-primary" type="submit">
          Create vehicle profile
        </button>
      </div>
    </form>
  )
}

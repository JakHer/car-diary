import { useEffect } from 'react'
import { VehicleForm } from './VehicleForm'
import type { Vehicle, VehicleInput } from '../types'

export type VehicleFormMode = 'add' | 'edit'

interface VehicleDialogProps {
  mode: VehicleFormMode
  vehicle: Vehicle
  onClose: () => void
  onSave: (input: VehicleInput) => void
}

export const VehicleDialog = ({
  mode,
  vehicle,
  onClose,
  onSave,
}: VehicleDialogProps) => {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="vehicle-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'edit' ? 'Edit vehicle' : 'Add vehicle'}
      >
        <button
          className="dialog-close"
          type="button"
          aria-label="Close vehicle form"
          onClick={onClose}
        >
          X
        </button>
        <VehicleForm
          key={mode === 'edit' ? vehicle.id : 'new'}
          vehicle={mode === 'edit' ? vehicle : undefined}
          onCancel={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  )
}

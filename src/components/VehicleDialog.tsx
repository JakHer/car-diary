import { useEffect } from 'react'
import { X } from 'lucide-react'
import { VehicleForm } from './VehicleForm'
import type { Vehicle, VehicleInput } from '../types'

export type VehicleFormMode = 'add' | 'edit'

interface VehicleDialogProps {
  isSaving: boolean
  mode: VehicleFormMode
  vehicle: Vehicle
  onClose: () => void
  onSave: (input: VehicleInput) => void
}

export const VehicleDialog = ({
  isSaving,
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
      className="fixed inset-0 z-20 grid place-items-center overflow-y-auto bg-[rgba(11,18,14,0.55)] p-6 backdrop-blur-[5px] max-[700px]:p-3"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="relative w-full max-w-[650px]"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'edit' ? 'Edit vehicle' : 'Add vehicle'}
      >
        <button
          className="absolute top-4 right-4 z-10 grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-surface-muted text-xs font-extrabold text-muted transition-colors hover:bg-border hover:text-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-soft"
          type="button"
          aria-label="Close vehicle form"
          onClick={onClose}
        >
          <X aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
        <VehicleForm
          className="max-h-[calc(100svh-48px)] overflow-y-auto max-[700px]:max-h-[calc(100svh-24px)]"
          isSaving={isSaving}
          key={mode === 'edit' ? vehicle.id : 'new'}
          vehicle={mode === 'edit' ? vehicle : undefined}
          onCancel={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  )
}

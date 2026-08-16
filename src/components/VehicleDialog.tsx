import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { VehicleForm } from './VehicleForm'
import type { Vehicle, VehicleInput } from '../types'

export type VehicleFormMode = 'add' | 'edit'

interface VehicleDialogProps {
  isSaving: boolean
  mode: VehicleFormMode
  open: boolean
  vehicle: Vehicle
  onClose: () => void
  onSave: (input: VehicleInput) => void
}

export const VehicleDialog = ({
  isSaving,
  mode,
  open,
  vehicle,
  onClose,
  onSave,
}: VehicleDialogProps) => {
  const { t } = useTranslation()
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(open)

  if (open && !wasOpenRef.current) {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
  }
  wasOpenRef.current = open

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 animate-[dialog-overlay-in_160ms_ease-out] bg-[rgba(11,18,14,0.55)] backdrop-blur-[5px]" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-30 w-[calc(100%_-_48px)] max-w-[650px] -translate-x-1/2 -translate-y-1/2 animate-[dialog-content-in_180ms_ease-out] outline-none max-[700px]:w-[calc(100%_-_24px)]"
          onCloseAutoFocus={(event) => {
            if (!returnFocusRef.current) return

            event.preventDefault()
            returnFocusRef.current.focus()
          }}
          onEscapeKeyDown={(event) => {
            if (isSaving) event.preventDefault()
          }}
          onPointerDownOutside={(event) => {
            if (isSaving) event.preventDefault()
          }}
        >
          <Dialog.Title className="sr-only">
            {mode === 'edit' ? t('vehicle.editTitle') : t('vehicle.addTitle')}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            {mode === 'edit'
              ? t('vehicle.editDialogDescription')
              : t('vehicle.addDialogDescription')}
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 z-10 grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-surface-muted text-xs font-extrabold text-muted transition-colors hover:bg-border hover:text-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-soft disabled:cursor-wait disabled:opacity-65"
              type="button"
              aria-label={
                mode === 'edit' ? t('vehicle.closeEdit') : t('vehicle.closeAdd')
              }
              disabled={isSaving}
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2} />
            </button>
          </Dialog.Close>
          <VehicleForm
            className="max-h-[calc(100svh-48px)] overflow-y-auto max-[700px]:max-h-[calc(100svh-24px)]"
            isSaving={isSaving}
            key={mode === 'edit' ? vehicle.id : 'new'}
            vehicle={mode === 'edit' ? vehicle : undefined}
            onCancel={onClose}
            onSave={onSave}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

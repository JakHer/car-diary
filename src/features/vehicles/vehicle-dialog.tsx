import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { VehicleForm } from './vehicle-form'
import type { DistanceUnit, Vehicle, VehicleInput } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

export type VehicleFormMode = 'add' | 'edit'

interface VehicleDialogProps {
  defaultDistanceUnit: DistanceUnit
  isSaving: boolean
  mode: VehicleFormMode
  open: boolean
  vehicle: Vehicle
  onClose: () => void
  onSave: (input: VehicleInput) => void
}

export const VehicleDialog = ({
  defaultDistanceUnit,
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) onClose()
      }}
    >
      <DialogContent
          className="w-[calc(100%_-_48px)] max-w-[650px] overflow-visible border-0 bg-transparent p-0 shadow-none max-[700px]:w-[calc(100%_-_24px)] max-[700px]:p-0"
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
          <DialogTitle className="sr-only">
            {mode === 'edit' ? t('vehicle.editTitle') : t('vehicle.addTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {mode === 'edit'
              ? t('vehicle.editDialogDescription')
              : t('vehicle.addDialogDescription')}
          </DialogDescription>
          <DialogClose asChild>
            <Button
              className="absolute top-4 right-4 z-10 rounded-full"
              size="icon-sm"
              variant="ghost"
              aria-label={
                mode === 'edit' ? t('vehicle.closeEdit') : t('vehicle.closeAdd')
              }
              disabled={isSaving}
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2} />
            </Button>
          </DialogClose>
          <VehicleForm
            className="max-h-[calc(100svh-48px)] overflow-y-auto max-[700px]:max-h-[calc(100svh-24px)]"
            isSaving={isSaving}
            defaultDistanceUnit={defaultDistanceUnit}
            key={mode === 'edit' ? vehicle.id : 'new'}
            vehicle={mode === 'edit' ? vehicle : undefined}
            onCancel={onClose}
            onSave={onSave}
          />
      </DialogContent>
    </Dialog>
  )
}

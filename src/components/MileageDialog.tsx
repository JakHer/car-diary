import { useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { Gauge, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  createMileageSchema,
  type MileageFormValues,
} from '../lib/validation'
import {
  fieldStyles,
  inputStyles,
  invalidControlStyles,
  joinClassNames,
  primaryButtonStyles,
  secondaryButtonStyles,
  smallActionStyles,
} from '../styles'
import { FieldError } from './FieldError'
import { Loader } from './Loader'

interface MileageDialogProps {
  currentMileage: number
  isSaving: boolean
  vehicleName: string
  onSave: (currentMileage: number) => Promise<void>
}

export const MileageDialog = ({
  currentMileage,
  isSaving,
  vehicleName,
  onSave,
}: MileageDialogProps) => {
  const [open, setOpen] = useState(false)
  const schema = useMemo(
    () => createMileageSchema(currentMileage),
    [currentMileage],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<MileageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentMileage },
    mode: 'onBlur',
  })
  const isBusy = isSaving || isSubmitting

  const changeOpen = (nextOpen: boolean) => {
    if (isBusy) return
    if (nextOpen) reset({ currentMileage })
    setOpen(nextOpen)
  }

  const saveMileage = async ({
    currentMileage: nextMileage,
  }: MileageFormValues) => {
    try {
      await onSave(nextMileage)
      setOpen(false)
    } catch {
      // The shared mutation error banner presents the Supabase error.
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger asChild>
        <button
          className={joinClassNames(smallActionStyles, 'mt-3')}
          type="button"
        >
          Update mileage
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 animate-[dialog-overlay-in_160ms_ease-out] bg-[rgba(11,18,14,0.55)] backdrop-blur-[5px]" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 animate-[dialog-content-in_180ms_ease-out] rounded-large border border-border bg-surface p-6 shadow-[0_24px_70px_rgba(11,18,14,0.24)] outline-none max-[700px]:p-5"
          onEscapeKeyDown={(event) => {
            if (isBusy) event.preventDefault()
          }}
          onPointerDownOutside={(event) => {
            if (isBusy) event.preventDefault()
          }}
        >
          <div className="flex items-start gap-4 pr-8">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Gauge aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <Dialog.Title className="m-0 text-xl font-bold tracking-[-0.025em] text-strong">
                Update mileage
              </Dialog.Title>
              <Dialog.Description className="mt-2 mb-0 text-sm leading-[1.6] text-muted">
                Enter the latest odometer reading for {vehicleName}. Mileage
                cannot be reduced later.
              </Dialog.Description>
            </div>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-surface-muted text-muted hover:bg-border hover:text-strong focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent-soft disabled:cursor-wait disabled:opacity-65"
              type="button"
              aria-label="Close mileage form"
              disabled={isBusy}
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2} />
            </button>
          </Dialog.Close>

          <form
            className="mt-6"
            aria-busy={isBusy}
            noValidate
            onSubmit={handleSubmit(saveMileage)}
          >
            <label className={fieldStyles}>
              <span>Current mileage (km)</span>
              <input
                className={joinClassNames(
                  inputStyles,
                  errors.currentMileage && invalidControlStyles,
                )}
                type="number"
                min={currentMileage}
                step="1"
                autoFocus
                aria-label="Current mileage (km)"
                aria-invalid={Boolean(errors.currentMileage)}
                {...register('currentMileage', { valueAsNumber: true })}
              />
              <FieldError message={errors.currentMileage?.message} />
            </label>

            <div className="mt-5 flex justify-end gap-2.5 max-[500px]:flex-col-reverse">
              <Dialog.Close asChild>
                <button
                  className={joinClassNames(
                    secondaryButtonStyles,
                    'min-w-[105px] max-[500px]:w-full',
                  )}
                  type="button"
                  disabled={isBusy}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                className={joinClassNames(
                  primaryButtonStyles,
                  'min-w-[138px] max-[500px]:w-full',
                )}
                type="submit"
                disabled={isBusy}
              >
                {isBusy ? (
                  <Loader label="Updating..." size="small" />
                ) : (
                  'Update mileage'
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

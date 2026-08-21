import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { Gauge, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  createMileageSchema,
  type MileageFormValues,
} from './vehicle-schema'
import { FieldError } from '@/components/forms/field-error'
import { useTranslatedFormErrors } from '@/hooks/use-translated-form-errors'
import { Loader } from '@/components/feedback/loader'
import type { DistanceUnit } from '@/types'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface MileageDialogProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  isSaving: boolean
  triggerContent?: ReactNode
  vehicleName: string
  onSave: (currentMileage: number) => Promise<void>
}

export const MileageDialog = ({
  currentMileage,
  distanceUnit,
  isSaving,
  triggerContent,
  vehicleName,
  onSave,
}: MileageDialogProps) => {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const schema = useMemo(
    () => createMileageSchema(currentMileage, distanceUnit, t),
    [currentMileage, distanceUnit, t],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    trigger,
  } = useForm<MileageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentMileage },
    mode: 'onBlur',
  })
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)
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
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        {triggerContent ?? (
          <Button
            className="mt-3 h-auto px-2 py-[5px] text-[11px]"
            variant="secondary"
          >
            {t('mileage.trigger')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
          className="max-w-[440px] p-6 max-[700px]:p-5"
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
              <DialogTitle>
                {t('mileage.title')}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {t('mileage.description', { vehicle: vehicleName })}
              </DialogDescription>
            </div>
          </div>

          <DialogClose asChild>
            <Button
              className="absolute top-4 right-4 rounded-full"
              size="icon-sm"
              variant="ghost"
              aria-label={t('mileage.close')}
              disabled={isBusy}
            >
              <X aria-hidden="true" className="size-4" strokeWidth={2} />
            </Button>
          </DialogClose>

          <form
            className="mt-6"
            aria-busy={isBusy}
            noValidate
            onSubmit={handleSubmit(saveMileage)}
          >
            <Field>
              <span>{t('mileage.current', { unit: distanceUnit })}</span>
              <Input
                type="number"
                min={currentMileage}
                step="1"
                autoFocus
                aria-label={t('mileage.current', { unit: distanceUnit })}
                aria-invalid={Boolean(errors.currentMileage)}
                {...register('currentMileage', { valueAsNumber: true })}
              />
              <FieldError message={errors.currentMileage?.message} />
            </Field>

            <DialogFooter className="mt-5">
              <DialogClose asChild>
                <Button
                  className="min-w-[105px] max-[500px]:w-full"
                  variant="secondary"
                  type="button"
                  disabled={isBusy}
                >
                  {t('common.cancel')}
                </Button>
              </DialogClose>
              <Button
                className="min-w-[138px] max-[500px]:w-full"
                type="submit"
                disabled={isBusy}
              >
                {isBusy ? (
                  <Loader label={t('mileage.updating')} size="small" />
                ) : (
                  t('mileage.trigger')
                )}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  )
}

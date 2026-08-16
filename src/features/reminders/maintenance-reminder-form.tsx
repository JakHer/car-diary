import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DistanceUnit, MaintenanceReminderInput } from '@/types'
import { DatePicker } from '@/components/forms/date-picker'
import { FieldError } from '@/components/forms/field-error'
import { Loader } from '@/components/feedback/loader'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useTranslatedFormErrors } from '@/hooks/use-translated-form-errors'
import {
  createMaintenanceReminderSchema,
  type MaintenanceReminderFormValues,
} from '@/lib/validation'

interface MaintenanceReminderFormProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  isSaving: boolean
  onCreate: (input: MaintenanceReminderInput) => Promise<void>
  onCreated: () => void
}

export const MaintenanceReminderForm = ({
  currentMileage,
  distanceUnit,
  isSaving,
  onCreate,
  onCreated,
}: MaintenanceReminderFormProps) => {
  const { i18n, t } = useTranslation()
  const schema = useMemo(() => createMaintenanceReminderSchema(t), [t])
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    trigger,
  } = useForm<MaintenanceReminderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      dueDate: '',
      dueMileage: null,
    },
    mode: 'onBlur',
  })
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)

  const createReminder = async ({
    title,
    dueDate,
    dueMileage,
  }: MaintenanceReminderFormValues) => {
    try {
      await onCreate({
        title,
        dueDate: dueDate || null,
        dueMileage,
      })
    } catch {
      return
    }

    reset()
    onCreated()
  }

  return (
    <form
      className="grid gap-4"
      aria-busy={isSaving}
      noValidate
      onSubmit={handleSubmit(createReminder)}
    >
      <Field>
        <span>{t('reminders.reminder')}</span>
        <Input
          placeholder={t('reminders.placeholder')}
          maxLength={160}
          aria-label={t('reminders.reminder')}
          aria-invalid={Boolean(errors.title)}
          {...register('title')}
        />
        <FieldError message={errors.title?.message} />
      </Field>
      <FieldGroup className="gap-4">
        <Field>
          <span>{t('reminders.dueDate')}</span>
          <Controller
            control={control}
            name="dueDate"
            render={({ field }) => (
              <DatePicker
                invalid={Boolean(errors.dueDate)}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldError message={errors.dueDate?.message} />
        </Field>
        <Field>
          <span>{t('reminders.dueMileage', { unit: distanceUnit })}</span>
          <Input
            type="number"
            min="0"
            step="1"
            placeholder={String(currentMileage + 10_000)}
            aria-label={t('reminders.dueMileage', {
              unit: distanceUnit,
            })}
            aria-invalid={Boolean(errors.dueMileage)}
            {...register('dueMileage', {
              setValueAs: (value) =>
                value === null || String(value).trim() === ''
                  ? null
                  : Number(value),
            })}
          />
          <FieldError message={errors.dueMileage?.message} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <Loader label={t('reminders.adding')} size="small" />
        ) : (
          t('reminders.add')
        )}
      </Button>
    </form>
  )
}

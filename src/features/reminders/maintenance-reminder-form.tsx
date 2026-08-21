import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  DistanceUnit,
  MaintenanceReminder,
  MaintenanceReminderInput,
} from '@/types'
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
} from './reminder-schema'

interface MaintenanceReminderFormProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  isSaving: boolean
  reminder?: MaintenanceReminder
  onSave: (input: MaintenanceReminderInput) => Promise<void>
  onSaved: () => void
}

export const MaintenanceReminderForm = ({
  currentMileage,
  distanceUnit,
  isSaving,
  reminder,
  onSave,
  onSaved,
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
      title: reminder?.title ?? '',
      dueDate: reminder?.dueDate ?? '',
      dueMileage: reminder?.dueMileage ?? null,
    },
    mode: 'onBlur',
  })
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)

  const saveReminder = async ({
    title,
    dueDate,
    dueMileage,
  }: MaintenanceReminderFormValues) => {
    try {
      await onSave({
        title,
        dueDate: dueDate || null,
        dueMileage,
      })
    } catch {
      return
    }

    if (!reminder) reset()
    onSaved()
  }

  return (
    <form
      className="grid gap-4"
      aria-busy={isSaving}
      noValidate
      onSubmit={handleSubmit(saveReminder)}
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
          <Loader
            label={t(reminder ? 'reminders.saving' : 'reminders.adding')}
            size="small"
          />
        ) : (
          t(reminder ? 'reminders.saveChanges' : 'reminders.add')
        )}
      </Button>
    </form>
  )
}

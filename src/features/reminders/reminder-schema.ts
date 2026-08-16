import type { TFunction } from 'i18next'
import { z } from 'zod'
import i18n from '@/i18n'
import { requiredText } from '@/lib/validation-helpers'

export const createMaintenanceReminderSchema = (t: TFunction = i18n.t) =>
  z
    .object({
      title: requiredText(t, t('validation.fields.reminder'), 160),
      dueDate: z
        .string()
        .refine(
          (value) => value === '' || z.iso.date().safeParse(value).success,
          t('validation.dueDate'),
        ),
      dueMileage: z
        .number({ error: t('validation.enterDueMileage') })
        .int(t('validation.wholeDueMileage'))
        .min(0, t('validation.negativeDueMileage'))
        .nullable(),
    })
    .refine(
      ({ dueDate, dueMileage }) => dueDate !== '' || dueMileage !== null,
      {
        message: t('validation.reminderTarget'),
        path: ['dueDate'],
      },
    )

export const maintenanceReminderSchema = createMaintenanceReminderSchema()

export type MaintenanceReminderFormValues = z.infer<
  ReturnType<typeof createMaintenanceReminderSchema>
>

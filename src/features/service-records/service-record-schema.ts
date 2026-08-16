import type { TFunction } from 'i18next'
import { z } from 'zod'
import i18n from '@/i18n'
import { requiredText } from '@/lib/validation-helpers'

export const createServiceRecordSchema = (t: TFunction = i18n.t) =>
  z.object({
    title: requiredText(t, t('validation.fields.service'), 160),
    category: z.enum([
      'Maintenance',
      'Repair',
      'Inspection',
      'Tires',
      'Other',
    ]),
    date: z.iso.date({ error: t('validation.serviceDate') }),
    mileage: z
      .number({ error: t('validation.enterMileage') })
      .int(t('validation.wholeMileage'))
      .min(0, t('validation.negativeMileage')),
    cost: z
      .number({ error: t('validation.enterCost') })
      .min(0, t('validation.negativeCost')),
    workshop: z.string().trim().max(160, t('validation.workshopMax')),
    notes: z.string().trim().max(2_000, t('validation.notesMax')),
  })

export const serviceRecordSchema = createServiceRecordSchema()

export type ServiceRecordFormValues = z.infer<
  ReturnType<typeof createServiceRecordSchema>
>

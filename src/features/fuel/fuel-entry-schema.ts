import type { TFunction } from 'i18next'
import { z } from 'zod'
import i18n from '@/i18n'

export const createFuelEntrySchema = (t: TFunction = i18n.t) =>
  z.object({
    date: z.iso.date({ error: t('validation.fuelDate') }),
    mileage: z
      .number({ error: t('validation.enterMileage') })
      .int(t('validation.wholeMileage'))
      .min(0, t('validation.negativeMileage')),
    liters: z
      .number({ error: t('validation.enterFuelVolume') })
      .positive(t('validation.positiveFuelVolume'))
      .max(500, t('validation.fuelVolumeMax')),
    totalCost: z
      .number({ error: t('validation.enterFuelCost') })
      .positive(t('validation.positiveFuelCost')),
    station: z.string().trim().max(160, t('validation.stationMax')),
    fullTank: z.boolean(),
  })

export const fuelEntrySchema = createFuelEntrySchema()

export type FuelEntryFormValues = z.infer<
  ReturnType<typeof createFuelEntrySchema>
>

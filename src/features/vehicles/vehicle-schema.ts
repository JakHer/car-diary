import type { TFunction } from 'i18next'
import { z } from 'zod'
import i18n from '@/i18n'
import type { DistanceUnit } from '@/types'
import { mileageSchema, requiredText } from '@/lib/validation-helpers'

const currentYear = new Date().getFullYear()

export const createVehicleSchema = (
  minimumMileage = 0,
  distanceUnit: DistanceUnit = 'km',
  t: TFunction = i18n.t,
) =>
  z.object({
    make: requiredText(t, t('validation.fields.make'), 80),
    model: requiredText(t, t('validation.fields.model'), 80),
    year: z
      .number({ error: t('validation.validYear') })
      .int(t('validation.wholeYear'))
      .min(1886, t('validation.yearMin'))
      .max(
        currentYear + 1,
        t('validation.yearMax', { maximum: currentYear + 1 }),
      ),
    distanceUnit: z.enum(['km', 'mi']),
    currentMileage: mileageSchema(t, minimumMileage, distanceUnit),
    registrationNumber: z
      .string()
      .trim()
      .max(32, t('validation.registrationMax')),
    vin: z
      .string()
      .trim()
      .toUpperCase()
      .refine(
        (value) => value.length === 0 || value.length === 17,
        t('validation.vinLength'),
      ),
  })

export const vehicleSchema = createVehicleSchema()

export const createMileageSchema = (
  minimumMileage: number,
  distanceUnit: DistanceUnit = 'km',
  t: TFunction = i18n.t,
) =>
  z.object({
    currentMileage: mileageSchema(t, minimumMileage, distanceUnit),
  })

export type VehicleFormValues = z.infer<ReturnType<typeof createVehicleSchema>>
export type MileageFormValues = z.infer<ReturnType<typeof createMileageSchema>>

import type { TFunction } from 'i18next'
import { z } from 'zod'
import i18n, { getIntlLocale } from '../i18n'
import type { DistanceUnit } from '../types'

const currentYear = new Date().getFullYear()

const requiredText = (
  t: TFunction,
  field: string,
  maximumLength: number,
) =>
  z
    .string()
    .trim()
    .min(1, t('validation.required', { field }))
    .max(
      maximumLength,
      t('validation.maxLength', { field, maximum: maximumLength }),
    )

const mileageSchema = (
  t: TFunction,
  minimumMileage = 0,
  distanceUnit: DistanceUnit = 'km',
) =>
  z
    .number({ error: t('validation.enterMileage') })
    .int(t('validation.wholeMileage'))
    .min(
      minimumMileage,
      minimumMileage === 0
        ? t('validation.negativeMileage')
        : t('validation.lowerMileage', {
            minimum: minimumMileage.toLocaleString(
              getIntlLocale(i18n.resolvedLanguage),
            ),
            unit: distanceUnit,
          }),
    )

export const createAuthSchema = (t: TFunction = i18n.t) =>
  z.object({
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: t('validation.email') })),
    password: z
      .string()
      .min(6, t('validation.passwordMin'))
      .max(128, t('validation.passwordMax')),
  })

export const authSchema = createAuthSchema()

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

export type AuthFormValues = z.infer<ReturnType<typeof createAuthSchema>>
export type VehicleFormValues = z.infer<ReturnType<typeof createVehicleSchema>>
export type MileageFormValues = z.infer<ReturnType<typeof createMileageSchema>>
export type ServiceRecordFormValues = z.infer<
  ReturnType<typeof createServiceRecordSchema>
>
export type FuelEntryFormValues = z.infer<
  ReturnType<typeof createFuelEntrySchema>
>
export type MaintenanceReminderFormValues = z.infer<
  ReturnType<typeof createMaintenanceReminderSchema>
>

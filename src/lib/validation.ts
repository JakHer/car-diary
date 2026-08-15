import { z } from 'zod'

const currentYear = new Date().getFullYear()

const requiredText = (field: string, maximumLength: number) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required.`)
    .max(maximumLength, `${field} must be at most ${maximumLength} characters.`)

export const authSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'Enter a valid email address.' })),
  password: z
    .string()
    .min(6, 'Password must contain at least 6 characters.')
    .max(128, 'Password must be at most 128 characters.'),
})

export const vehicleSchema = z.object({
  make: requiredText('Make', 80),
  model: requiredText('Model', 80),
  year: z
    .number({ error: 'Enter a valid year.' })
    .int('Year must be a whole number.')
    .min(1886, 'Year must be 1886 or later.')
    .max(currentYear + 1, `Year must be ${currentYear + 1} or earlier.`),
  currentMileage: z
    .number({ error: 'Enter the mileage.' })
    .int('Mileage must be a whole number.')
    .min(0, 'Mileage cannot be negative.'),
  registrationNumber: z
    .string()
    .trim()
    .max(32, 'Registration number must be at most 32 characters.'),
  vin: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (value) => value.length === 0 || value.length === 17,
      'VIN must contain exactly 17 characters.',
    ),
})

export const serviceRecordSchema = z.object({
  title: requiredText('Service', 160),
  category: z.enum([
    'Maintenance',
    'Repair',
    'Inspection',
    'Tires',
    'Other',
  ]),
  date: z.iso.date({ error: 'Choose a valid service date.' }),
  mileage: z
    .number({ error: 'Enter the mileage.' })
    .int('Mileage must be a whole number.')
    .min(0, 'Mileage cannot be negative.'),
  cost: z
    .number({ error: 'Enter the service cost.' })
    .min(0, 'Cost cannot be negative.'),
  workshop: z
    .string()
    .trim()
    .max(160, 'Workshop must be at most 160 characters.'),
  notes: z
    .string()
    .trim()
    .max(2_000, 'Notes must be at most 2000 characters.'),
})

export const maintenanceReminderSchema = z
  .object({
    title: requiredText('Reminder', 160),
    dueDate: z
      .string()
      .refine(
        (value) => value === '' || z.iso.date().safeParse(value).success,
        'Choose a valid due date.',
      ),
    dueMileage: z
      .number({ error: 'Enter a valid due mileage.' })
      .int('Due mileage must be a whole number.')
      .min(0, 'Due mileage cannot be negative.')
      .nullable(),
  })
  .refine(
    ({ dueDate, dueMileage }) => dueDate !== '' || dueMileage !== null,
    {
      message: 'Add a due date, due mileage, or both.',
      path: ['dueDate'],
    },
  )

export type AuthFormValues = z.infer<typeof authSchema>
export type VehicleFormValues = z.infer<typeof vehicleSchema>
export type ServiceRecordFormValues = z.infer<typeof serviceRecordSchema>
export type MaintenanceReminderFormValues = z.infer<
  typeof maintenanceReminderSchema
>

import type { TFunction } from 'i18next'
import { z } from 'zod'
import i18n from '@/i18n'

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

export type AuthFormValues = z.infer<ReturnType<typeof createAuthSchema>>

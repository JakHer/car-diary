import type { TFunction } from 'i18next'
import { z } from 'zod'
import i18n, { getIntlLocale } from '@/i18n'
import type { DistanceUnit } from '@/types'

export const requiredText = (
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

export const mileageSchema = (
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

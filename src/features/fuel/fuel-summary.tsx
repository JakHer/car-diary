import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { DistanceUnit, FuelEntry } from '@/types'
import { formatDistance } from '@/lib/distance-units'
import {
  calculateFuelConsumption,
  calculateRecordedDistanceForYear,
} from '@/lib/fuel-consumption'

interface FuelSummaryProps {
  distanceUnit: DistanceUnit
  entries: FuelEntry[]
  locale: string
}

export const FuelSummary = ({
  distanceUnit,
  entries,
  locale,
}: FuelSummaryProps) => {
  const { t } = useTranslation()
  const consumption = calculateFuelConsumption(entries, distanceUnit)
  const currentYear = new Date().getFullYear()
  const recordedDistance = calculateRecordedDistanceForYear(
    entries,
    currentYear,
  )
  const consumptionFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2,
      }),
    [locale],
  )
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'PLN',
      }),
    [locale],
  )

  return (
    <div className="mb-4 grid grid-cols-3 gap-3 max-[760px]:grid-cols-1">
      <div>
        <span className="block text-xs font-bold tracking-[0.03em] text-muted uppercase">
          {t('fuel.averageConsumption')}
        </span>
        <strong className="mt-1 block text-lg text-strong">
          {consumption
            ? t('fuel.averageConsumptionValue', {
                value: consumptionFormatter.format(
                  consumption.litersPer100Kilometers,
                ),
              })
            : '—'}
        </strong>
        <span className="mt-1 block text-xs text-muted">
          {consumption
            ? t('fuel.consumptionDescription')
            : t('fuel.consumptionUnavailable')}
        </span>
      </div>
      <div>
        <span className="block text-xs font-bold tracking-[0.03em] text-muted uppercase">
          {t('fuel.costPer100Kilometers')}
        </span>
        <strong className="mt-1 block text-lg text-strong">
          {consumption
            ? t('fuel.costPer100KilometersValue', {
                value: currencyFormatter.format(
                  consumption.costPer100KilometersInCents / 100,
                ),
              })
            : '—'}
        </strong>
      </div>
      <div>
        <span className="block text-xs font-bold tracking-[0.03em] text-muted uppercase">
          {t('fuel.recordedDistance', { year: currentYear })}
        </span>
        <strong className="mt-1 block text-lg text-strong">
          {recordedDistance
            ? formatDistance(
                recordedDistance.distance,
                distanceUnit,
                locale,
              )
            : '—'}
        </strong>
        <span className="mt-1 block text-xs text-muted">
          {t('fuel.recordedDistanceDescription')}
        </span>
      </div>
    </div>
  )
}

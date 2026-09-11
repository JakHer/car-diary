import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DistanceUnit, FuelEntry, ServiceRecord } from '@/types'
import { formatDistance } from '@/lib/distance-units'
import {
  calculateVehicleCostStatistics,
  getVehicleStatisticsYears,
} from '@/lib/vehicle-cost-statistics'
import { StatCard } from '@/components/data-display/stat-card'
import { SelectField } from '@/components/forms/select-field'
import { DashboardSection } from '@/components/layout/dashboard-section'
import { VehicleCostChart } from './vehicle-cost-chart'

interface VehicleStatisticsProps {
  distanceUnit: DistanceUnit
  fuelEntries: FuelEntry[]
  locale: string
  records: ServiceRecord[]
}

export const VehicleStatistics = ({
  distanceUnit,
  fuelEntries,
  locale,
  records,
}: VehicleStatisticsProps) => {
  const { t } = useTranslation()
  const availableYears = useMemo(
    () => getVehicleStatisticsYears(records, fuelEntries),
    [fuelEntries, records],
  )
  const [requestedYear, setRequestedYear] = useState(availableYears[0])
  const selectedYear = availableYears.includes(requestedYear)
    ? requestedYear
    : availableYears[0]
  const statistics = useMemo(
    () =>
      calculateVehicleCostStatistics(
        records,
        fuelEntries,
        selectedYear,
      ),
    [fuelEntries, records, selectedYear],
  )
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 2,
      }),
    [locale],
  )
  const formatCost = (costInCents: number) =>
    currencyFormatter.format(costInCents / 100)

  return (
    <>
      <section
        className="mt-6 grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1"
        aria-label={t('statistics.summaryAria', { year: selectedYear })}
      >
        <StatCard
          description={t('statistics.totalDescription', {
            year: selectedYear,
          })}
          label={t('statistics.totalCosts')}
          value={formatCost(statistics.totalCostInCents)}
        />
        <StatCard
          description={t('statistics.serviceDescription')}
          label={t('statistics.serviceCosts')}
          value={formatCost(statistics.serviceCostInCents)}
        />
        <StatCard
          description={t('statistics.fuelDescription')}
          label={t('statistics.fuelCosts')}
          value={formatCost(statistics.fuelCostInCents)}
        />
        <StatCard
          description={t('statistics.averageDescription', {
            year: selectedYear,
          })}
          label={t('statistics.monthlyAverage')}
          value={
            statistics.averageMonthlyCostInCents === null
              ? '—'
              : formatCost(statistics.averageMonthlyCostInCents)
          }
        />
        <StatCard
          description={t('statistics.costPerDistanceDescription')}
          label={t('statistics.costPerDistance', { unit: distanceUnit })}
          value={
            statistics.costPerDistanceUnitInCents === null
              ? '—'
              : t('statistics.costPerDistanceValue', {
                  value: formatCost(statistics.costPerDistanceUnitInCents),
                  unit: distanceUnit,
                })
          }
        />
        <StatCard
          description={t('statistics.recordedDistanceDescription')}
          label={t('statistics.recordedDistance')}
          value={
            statistics.recordedDistance === null
              ? '—'
              : formatDistance(
                  statistics.recordedDistance,
                  distanceUnit,
                  locale,
                )
          }
        />
      </section>

      <DashboardSection
        actions={
          <SelectField
            ariaLabel={t('statistics.year')}
            options={availableYears.map((year) => ({
              label: String(year),
              value: String(year),
            }))}
            value={String(selectedYear)}
            variant="compact"
            onValueChange={(value) => setRequestedYear(Number(value))}
          />
        }
        className="mt-6"
        contentClassName="mt-6"
        eyebrow={t('statistics.eyebrow')}
        title={t('statistics.monthlyTitle')}
        titleId="vehicle-cost-statistics-title"
      >
        <VehicleCostChart
          locale={locale}
          monthlyCosts={statistics.monthlyCosts}
        />
      </DashboardSection>
    </>
  )
}

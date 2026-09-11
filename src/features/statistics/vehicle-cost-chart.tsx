import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3 } from 'lucide-react'
import type { MonthlyVehicleCosts } from '@/lib/vehicle-cost-statistics'
import { EmptyState } from '@/components/feedback/empty-state'

interface VehicleCostChartProps {
  locale: string
  monthlyCosts: MonthlyVehicleCosts[]
}

export const VehicleCostChart = ({
  locale,
  monthlyCosts,
}: VehicleCostChartProps) => {
  const { t } = useTranslation()
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'PLN',
        maximumFractionDigits: 0,
      }),
    [locale],
  )
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short' }),
    [locale],
  )
  const maximumMonthlyCost = Math.max(
    ...monthlyCosts.map(({ totalCostInCents }) => totalCostInCents),
  )

  if (maximumMonthlyCost === 0) {
    return (
      <EmptyState
        className="min-h-[260px]"
        description={t('statistics.emptyDescription')}
        icon={BarChart3}
        title={t('statistics.emptyTitle')}
      />
    )
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-accent" />
          {t('statistics.serviceCosts')}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-strong" />
          {t('statistics.fuelCosts')}
        </span>
      </div>
      <div className="grid gap-3">
        {monthlyCosts.map((month) => {
          const monthName = monthFormatter.format(
            new Date(2020, month.monthIndex, 1),
          )
          const serviceWidth =
            (month.serviceCostInCents / maximumMonthlyCost) * 100
          const fuelWidth =
            (month.fuelCostInCents / maximumMonthlyCost) * 100

          return (
            <div
              aria-label={t('statistics.monthSummary', {
                month: monthName,
                total: currencyFormatter.format(month.totalCostInCents / 100),
                service: currencyFormatter.format(
                  month.serviceCostInCents / 100,
                ),
                fuel: currencyFormatter.format(month.fuelCostInCents / 100),
              })}
              className="grid grid-cols-[42px_minmax(100px,1fr)_90px] items-center gap-3 max-[520px]:grid-cols-[34px_minmax(80px,1fr)_72px]"
              key={month.monthIndex}
            >
              <span className="text-xs font-bold text-muted capitalize">
                {monthName}
              </span>
              <span className="flex h-3 overflow-hidden rounded-full bg-surface-muted">
                <span
                  className="h-full bg-accent"
                  style={{ width: `${serviceWidth}%` }}
                />
                <span
                  className="h-full bg-strong"
                  style={{ width: `${fuelWidth}%` }}
                />
              </span>
              <strong className="text-right text-xs text-strong">
                {currencyFormatter.format(month.totalCostInCents / 100)}
              </strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { ChartNoAxesCombined } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type {
  DistanceUnit,
  FuelEntry,
  OdometerReading,
  ServiceRecord,
} from '@/types'
import { EmptyState } from '@/components/feedback/empty-state'
import { Tooltip } from '@/components/overlays/tooltip'
import { formatDistance } from '@/lib/distance-units'
import { normalizeOdometerReadings } from '@/lib/odometer-readings'

interface OdometerChartProps {
  distanceUnit: DistanceUnit
  fuelEntries: FuelEntry[]
  locale: string
  readings: OdometerReading[]
  records: ServiceRecord[]
  year: number
}

const chartWidth = 800
const chartHeight = 250
const chartPadding = { top: 20, right: 24, bottom: 44, left: 92 }

export const OdometerChart = ({
  distanceUnit,
  fuelEntries,
  locale,
  readings,
  records,
  year,
}: OdometerChartProps) => {
  const { t } = useTranslation()
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
      }),
    [locale],
  )
  const volumeFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }),
    [locale],
  )
  const fuelEntriesById = new Map(
    fuelEntries.map((entry) => [entry.id, entry]),
  )
  const recordsById = new Map(records.map((record) => [record.id, record]))
  const chartReadings = normalizeOdometerReadings(
    readings.filter(({ date }) => Number(date.slice(0, 4)) === year),
  )

  if (chartReadings.length < 2) {
    return (
      <EmptyState
        className="min-h-[260px]"
        description={t('statistics.odometerEmptyDescription')}
        icon={ChartNoAxesCombined}
        title={t('statistics.odometerEmptyTitle')}
      />
    )
  }

  const minimumMileage = Math.min(
    ...chartReadings.map(({ mileage }) => mileage),
  )
  const maximumMileage = Math.max(
    ...chartReadings.map(({ mileage }) => mileage),
  )
  const mileageRange = maximumMileage - minimumMileage
  const firstTimestamp = new Date(
    `${chartReadings[0].date}T12:00:00`,
  ).getTime()
  const lastTimestamp = new Date(
    `${chartReadings.at(-1)?.date}T12:00:00`,
  ).getTime()
  const timestampRange = Math.max(lastTimestamp - firstTimestamp, 1)
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom
  const points = chartReadings.map((reading) => {
    const timestamp = new Date(`${reading.date}T12:00:00`).getTime()
    const x =
      chartPadding.left +
      ((timestamp - firstTimestamp) / timestampRange) * plotWidth
    const y =
      mileageRange === 0
        ? chartPadding.top + plotHeight / 2
        : chartPadding.top +
          ((maximumMileage - reading.mileage) / mileageRange) * plotHeight

    return { reading, x, y }
  })
  const linePath = points
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ')
  const areaPath = `${linePath} L ${points.at(-1)?.x} ${
    chartPadding.top + plotHeight
  } L ${points[0].x} ${chartPadding.top + plotHeight} Z`
  const gridValues =
    mileageRange === 0
      ? [minimumMileage]
      : [maximumMileage, minimumMileage + mileageRange / 2, minimumMileage]

  return (
    <div className="overflow-x-auto pb-1">
      <svg
        aria-label={t('statistics.odometerChartAria', { year })}
        className="h-auto w-full min-w-[620px] text-muted"
        role="img"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        <defs>
          <linearGradient id="odometer-area-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {gridValues.map((value) => {
          const y =
            mileageRange === 0
              ? chartPadding.top + plotHeight / 2
              : chartPadding.top +
                ((maximumMileage - value) / mileageRange) * plotHeight

          return (
            <g key={value}>
              <line
                className="stroke-border"
                x1={chartPadding.left}
                x2={chartWidth - chartPadding.right}
                y1={y}
                y2={y}
              />
              <text
                className="fill-muted text-[11px] font-semibold"
                textAnchor="end"
                x={chartPadding.left - 12}
                y={y + 4}
              >
                {formatDistance(Math.round(value), distanceUnit, locale)}
              </text>
            </g>
          )
        })}

        <path
          className="text-accent"
          d={areaPath}
          fill="url(#odometer-area-gradient)"
        />
        <path
          className="fill-none stroke-accent"
          d={linePath}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />

        {points.map(({ reading, x, y }) => {
          const fuelEntry = reading.sourceId
            ? fuelEntriesById.get(reading.sourceId)
            : undefined
          const serviceRecord = reading.sourceId
            ? recordsById.get(reading.sourceId)
            : undefined
          const event =
            reading.source === 'fuel'
              ? fuelEntry
                ? [
                    t('home.fuelActivity', {
                      volume: volumeFormatter.format(
                        fuelEntry.volumeInMilliliters / 1_000,
                      ),
                    }),
                    fuelEntry.station,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : t('statistics.odometerFuelEvent')
              : reading.source === 'service'
                ? (serviceRecord?.title ??
                  t('statistics.odometerServiceEvent'))
                : t(`statistics.odometerSource.${reading.source}`)
          const label = t('statistics.odometerPoint', {
            event,
            date: dateFormatter.format(
              new Date(`${reading.date}T12:00:00`),
            ),
            distance: formatDistance(
              reading.mileage,
              distanceUnit,
              locale,
            ),
          })

          return (
            <Tooltip key={reading.date} label={label}>
              <circle
                aria-label={label}
                className="cursor-help fill-surface stroke-accent outline-none transition-colors hover:fill-accent-soft focus:fill-accent-soft"
                cx={x}
                cy={y}
                r="6"
                role="graphics-symbol"
                strokeWidth="3"
                tabIndex={0}
              />
            </Tooltip>
          )
        })}

        <text
          className="fill-muted text-[11px] font-semibold"
          x={chartPadding.left}
          y={chartHeight - 10}
        >
          {dateFormatter.format(new Date(`${chartReadings[0].date}T12:00:00`))}
        </text>
        <text
          className="fill-muted text-[11px] font-semibold"
          textAnchor="end"
          x={chartWidth - chartPadding.right}
          y={chartHeight - 10}
        >
          {dateFormatter.format(
            new Date(`${chartReadings.at(-1)?.date}T12:00:00`),
          )}
        </text>
      </svg>
    </div>
  )
}

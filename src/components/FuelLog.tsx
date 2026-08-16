import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Fuel, Trash2 } from 'lucide-react'
import type { DistanceUnit, FuelEntry, FuelEntryInput } from '../types'
import { getIntlLocale } from '../i18n'
import {
  createFuelEntrySchema,
  type FuelEntryFormValues,
} from '../lib/validation'
import { formatDistance } from '../lib/distanceUnits'
import {
  calculateFuelConsumption,
  calculateRecordedDistanceForYear,
} from '../lib/fuelConsumption'
import { useTranslatedFormErrors } from '../hooks/useTranslatedFormErrors'
import { DatePicker } from './DatePicker'
import { FieldError } from './FieldError'
import { IconButton } from './IconButton'
import { Loader } from './Loader'
import {
  cardStyles,
  eyebrowStyles,
  fieldStyles,
  formGridStyles,
  inputStyles,
  invalidControlStyles,
  joinClassNames,
  primaryButtonStyles,
  sectionHeadingStyles,
  sectionTitleStyles,
  tagStyles,
} from '../styles'

interface FuelLogProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  entries: FuelEntry[]
  isSaving: boolean
  onCreate: (input: FuelEntryInput) => Promise<void>
  onDelete: (fuelEntryId: string) => void
}

const getLocalDate = (): string => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

export const FuelLog = ({
  currentMileage,
  distanceUnit,
  entries,
  isSaving,
  onCreate,
  onDelete,
}: FuelLogProps) => {
  const { i18n, t } = useTranslation()
  const locale = getIntlLocale(i18n.resolvedLanguage)
  const schema = useMemo(() => createFuelEntrySchema(t), [t])
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
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
  const volumeFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 3,
      }),
    [locale],
  )
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
  } = useForm<FuelEntryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: getLocalDate(),
      mileage: currentMileage,
      liters: undefined,
      totalCost: undefined,
      station: '',
      fullTank: false,
    },
    mode: 'onBlur',
  })
  useTranslatedFormErrors(i18n.resolvedLanguage, errors, trigger)

  const orderedEntries = entries.toSorted(
    (first, second) =>
      second.date.localeCompare(first.date) || second.mileage - first.mileage,
  )
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

  const createEntry = async ({
    liters,
    totalCost,
    ...values
  }: FuelEntryFormValues) => {
    try {
      await onCreate({
        ...values,
        volumeInMilliliters: Math.round(liters * 1_000),
        totalCostInCents: Math.round(totalCost * 100),
      })
    } catch {
      return
    }

    reset({
      date: getLocalDate(),
      mileage: Math.max(currentMileage, values.mileage),
      station: '',
      fullTank: false,
    })
    setValue('liters', Number.NaN)
    setValue('totalCost', Number.NaN)
  }

  return (
    <section
      className={joinClassNames(
        cardStyles,
        'mt-6 p-7 max-[700px]:p-[22px]',
      )}
      aria-labelledby="fuel-log-title"
    >
      <div
        className={joinClassNames(
          sectionHeadingStyles,
          'border-b border-border pb-[22px]',
        )}
      >
        <div>
          <p className={eyebrowStyles}>{t('fuel.eyebrow')}</p>
          <h2 className={sectionTitleStyles} id="fuel-log-title">
            {t('fuel.title')}
          </h2>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className={joinClassNames(tagStyles, 'whitespace-nowrap')}>
            {t('fuel.entryCount', { count: entries.length })}
          </span>
        </div>
      </div>

      <div className="mt-[22px] grid grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] items-start gap-7 max-[980px]:grid-cols-1">
        <form
          className="grid gap-4"
          aria-busy={isSaving}
          noValidate
          onSubmit={handleSubmit(createEntry)}
        >
          <div className={joinClassNames(formGridStyles, 'gap-4')}>
            <label className={fieldStyles}>
              <span>{t('fuel.date')}</span>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    invalid={Boolean(errors.date)}
                    name={field.name}
                    required
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
              <FieldError message={errors.date?.message} />
            </label>

            <label className={fieldStyles}>
              <span>{t('fuel.mileage', { unit: distanceUnit })}</span>
              <input
                className={joinClassNames(
                  inputStyles,
                  errors.mileage && invalidControlStyles,
                )}
                type="number"
                min="0"
                step="1"
                aria-label={t('fuel.mileage', { unit: distanceUnit })}
                aria-invalid={Boolean(errors.mileage)}
                {...register('mileage', { valueAsNumber: true })}
              />
              <FieldError message={errors.mileage?.message} />
            </label>

            <label className={fieldStyles}>
              <span>{t('fuel.volume')}</span>
              <input
                className={joinClassNames(
                  inputStyles,
                  errors.liters && invalidControlStyles,
                )}
                type="number"
                min="0.001"
                max="500"
                step="0.001"
                placeholder="0.000"
                aria-label={t('fuel.volume')}
                aria-invalid={Boolean(errors.liters)}
                {...register('liters', { valueAsNumber: true })}
              />
              <FieldError message={errors.liters?.message} />
            </label>

            <label className={fieldStyles}>
              <span>{t('fuel.totalCost')}</span>
              <input
                className={joinClassNames(
                  inputStyles,
                  errors.totalCost && invalidControlStyles,
                )}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                aria-label={t('fuel.totalCost')}
                aria-invalid={Boolean(errors.totalCost)}
                {...register('totalCost', { valueAsNumber: true })}
              />
              <FieldError message={errors.totalCost?.message} />
            </label>
          </div>

          <label className={fieldStyles}>
            <span>{t('fuel.station')}</span>
            <input
              className={joinClassNames(
                inputStyles,
                errors.station && invalidControlStyles,
              )}
              placeholder={t('fuel.stationPlaceholder')}
              aria-label={t('fuel.station')}
              aria-invalid={Boolean(errors.station)}
              {...register('station')}
            />
            <FieldError message={errors.station?.message} />
          </label>

          <label className="flex min-h-10 cursor-pointer items-center gap-3 text-[13px] font-semibold text-strong">
            <input
              className="size-4 accent-accent"
              type="checkbox"
              {...register('fullTank')}
            />
            <span>{t('fuel.fullTank')}</span>
          </label>

          <button
            className={joinClassNames(primaryButtonStyles, 'justify-self-start')}
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader label={t('fuel.adding')} size="small" />
            ) : (
              t('fuel.add')
            )}
          </button>
        </form>

        {orderedEntries.length === 0 ? (
          <div className="grid min-h-52 place-content-center text-center">
            <Fuel
              aria-hidden="true"
              className="mx-auto mb-3 size-6 text-muted"
            />
            <p className="m-0 font-bold text-strong">
              {t('fuel.emptyTitle')}
            </p>
            <span className="mt-1.5 max-w-sm text-[13px] text-muted">
              {t('fuel.emptyDescription')}
            </span>
          </div>
        ) : (
          <div>
            <div className="mb-3 grid grid-cols-3 gap-5 rounded-[10px] border border-border bg-surface-muted/35 px-4 py-3 max-[760px]:grid-cols-1 max-[760px]:gap-3">
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
              <div className="border-l border-border pl-5 max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:pt-3 max-[760px]:pl-0">
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
              <div className="border-l border-border pl-5 max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:pt-3 max-[760px]:pl-0">
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
            <ol className="m-0 grid list-none gap-2.5 p-0">
              {orderedEntries.map((entry) => {
                const liters = entry.volumeInMilliliters / 1_000
                const pricePerLiter =
                  entry.totalCostInCents / 100 / liters

                return (
                  <li
                    className="flex items-center justify-between gap-4 rounded-[11px] border border-border bg-surface-muted/35 px-4 py-3.5"
                    key={entry.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm text-strong">
                          {volumeFormatter.format(liters)} l
                        </strong>
                        <span className="text-sm font-bold text-strong">
                          {currencyFormatter.format(
                            entry.totalCostInCents / 100,
                          )}
                        </span>
                        {entry.fullTank && (
                          <span className={tagStyles}>
                            {t('fuel.fullTankBadge')}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                        <span>
                          {dateFormatter.format(
                            new Date(`${entry.date}T12:00:00`),
                          )}
                        </span>
                        <span>
                          {formatDistance(
                            entry.mileage,
                            distanceUnit,
                            locale,
                          )}
                        </span>
                        <span>
                          {t('fuel.pricePerLiter', {
                            price: currencyFormatter.format(pricePerLiter),
                          })}
                        </span>
                        {entry.station && <span>{entry.station}</span>}
                      </div>
                    </div>
                    <IconButton
                      label={t('common.delete')}
                      variant="danger"
                      onClick={() => onDelete(entry.id)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </IconButton>
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}

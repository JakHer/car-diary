import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Search, SearchX, Trash2, X } from 'lucide-react'
import { SelectField } from './SelectField'
import { IconButton } from './IconButton'
import type {
  DistanceUnit,
  ServiceCategory,
  ServiceRecord,
} from '../types'
import {
  cardStyles,
  eyebrowStyles,
  joinClassNames,
  sectionHeadingStyles,
  sectionTitleStyles,
  smallActionStyles,
  tagStyles,
} from '../styles'
import { getIntlLocale } from '../i18n'
import { formatDistance } from '../lib/distanceUnits'

interface ServiceHistoryProps {
  distanceUnit: DistanceUnit
  records: ServiceRecord[]
  editingRecordId: string | null
  onDelete: (recordId: string) => void
  onEdit: (recordId: string) => void
}

type CategoryFilter = 'all' | ServiceCategory
type RecordSort = 'newest' | 'oldest' | 'mileage' | 'cost'

const categories: CategoryFilter[] = [
  'all',
  'Maintenance',
  'Repair',
  'Inspection',
  'Tires',
  'Other',
]

export const ServiceHistory = ({
  distanceUnit,
  records,
  editingRecordId,
  onDelete,
  onEdit,
}: ServiceHistoryProps) => {
  const { i18n, t } = useTranslation()
  const locale = getIntlLocale(i18n.resolvedLanguage)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [sort, setSort] = useState<RecordSort>('newest')
  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
  const categoryOptions = categories.map((value) => ({
    label: t(`service.categories.${value}`),
    value,
  }))
  const sortOptions: Array<{ label: string; value: RecordSort }> = [
    { label: t('history.sortNewest'), value: 'newest' },
    { label: t('history.sortOldest'), value: 'oldest' },
    { label: t('history.sortMileage'), value: 'mileage' },
    { label: t('history.sortCost'), value: 'cost' },
  ]
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
  const visibleRecords = useMemo(() => {
    const filteredRecords = records.filter((record) => {
      const matchesCategory =
        category === 'all' || record.category === category
      const searchableContent = [
        record.title,
        record.workshop,
        record.notes,
      ]
        .join(' ')
        .toLocaleLowerCase(locale)

      return (
        matchesCategory &&
        (normalizedQuery === '' ||
          searchableContent.includes(normalizedQuery))
      )
    })

    return filteredRecords.toSorted((first, second) => {
      if (sort === 'oldest') {
        return (
          first.date.localeCompare(second.date) ||
          first.mileage - second.mileage
        )
      }
      if (sort === 'mileage') return second.mileage - first.mileage
      if (sort === 'cost') return second.costInCents - first.costInCents

      return (
        second.date.localeCompare(first.date) ||
        second.mileage - first.mileage
      )
    })
  }, [category, locale, normalizedQuery, records, sort])
  const hasActiveFilters = normalizedQuery !== '' || category !== 'all'
  const clearFilters = () => {
    setQuery('')
    setCategory('all')
  }

  return (
    <section
      className={joinClassNames(cardStyles, 'p-7 max-[700px]:p-[22px]')}
    >
      <div
        className={joinClassNames(
          sectionHeadingStyles,
          'border-b border-border pb-[22px]',
        )}
      >
        <div>
          <p className={eyebrowStyles}>{t('history.eyebrow')}</p>
          <h2 className={sectionTitleStyles}>{t('history.title')}</h2>
        </div>
        <span className={tagStyles}>
          {hasActiveFilters && visibleRecords.length !== records.length
            ? t('history.filteredEntries', {
                visible: visibleRecords.length,
                total: records.length,
              })
            : t('history.entryCount', { count: records.length })}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="grid min-h-[370px] place-content-center justify-items-center px-5 py-12 text-center">
          <span
            className="mb-5 grid size-12 place-items-center rounded-full bg-accent-soft text-2xl text-accent"
            aria-hidden="true"
          >
            +
          </span>
          <h3 className="m-0 text-lg text-strong">
            {t('history.emptyTitle')}
          </h3>
          <p className="mt-2 mb-0 max-w-[360px] text-sm leading-[1.6] text-muted">
            {t('history.emptyDescription')}
          </p>
        </div>
      ) : (
        <>
          <div
            className="grid grid-cols-[minmax(180px,1fr)_auto_auto] gap-2.5 border-b border-border py-4 max-[700px]:grid-cols-2"
            aria-label={t('history.filtersAria')}
          >
            <div className="relative max-[700px]:col-span-2">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-light"
                strokeWidth={1.75}
              />
              <input
                className="h-9 w-full rounded-[9px] border border-border-strong bg-surface pr-9 pl-9 text-[13px] font-medium text-strong outline-none transition-[border-color,box-shadow] placeholder:text-light focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] [&::-webkit-search-cancel-button]:hidden"
                type="search"
                aria-label={t('history.search')}
                placeholder={t('history.searchPlaceholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button
                  className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-muted hover:bg-surface-muted hover:text-strong focus-visible:bg-surface-muted focus-visible:text-strong"
                  type="button"
                  aria-label={t('history.clearSearch')}
                  onClick={() => setQuery('')}
                >
                  <X aria-hidden="true" className="size-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
            <SelectField
              ariaLabel={t('history.category')}
              options={categoryOptions}
              value={category}
              variant="toolbar"
              onValueChange={(value) =>
                setCategory(value as CategoryFilter)
              }
            />
            <SelectField
              ariaLabel={t('history.sort')}
              options={sortOptions}
              value={sort}
              variant="toolbar"
              onValueChange={(value) => setSort(value as RecordSort)}
            />
          </div>

          {visibleRecords.length === 0 ? (
            <div className="grid min-h-[280px] place-content-center justify-items-center px-5 py-12 text-center">
              <span className="mb-4 grid size-11 place-items-center rounded-full bg-surface-muted text-muted">
                <SearchX aria-hidden="true" className="size-5" />
              </span>
              <h3 className="m-0 text-lg text-strong">
                {t('history.noMatchesTitle')}
              </h3>
              <p className="mt-2 mb-0 max-w-[340px] text-sm leading-[1.6] text-muted">
                {t('history.noMatchesDescription')}
              </p>
              <button
                className={joinClassNames(smallActionStyles, 'mt-4 px-3 py-2')}
                type="button"
                onClick={clearFilters}
              >
                {t('history.clearFilters')}
              </button>
            </div>
          ) : (
            <ol className="m-0 list-none pt-2 pl-0">
              {visibleRecords.map((record) => (
                <li
                  className={joinClassNames(
                    'relative border-b border-border py-6 pr-0 pl-7 last:border-b-0',
                    editingRecordId === record.id &&
                      'shadow-[inset_3px_0_var(--color-accent)]',
                  )}
                  key={record.id}
                >
                  <div
                    className="absolute top-[30px] left-0 size-2.5 rounded-full border-[3px] border-surface bg-accent shadow-[0_0_0_1px_var(--color-accent)]"
                    aria-hidden="true"
                  />
                  <article>
                    <div className="flex items-start justify-between gap-5 max-[700px]:flex-col">
                      <div>
                        <span
                          className={joinClassNames(
                            tagStyles,
                            'inline-block bg-accent-soft text-accent',
                          )}
                        >
                          {t(`service.categories.${record.category}`)}
                        </span>
                        <h3 className="mt-3 mb-0 text-lg text-strong">
                          {record.title}
                        </h3>
                      </div>
                      <div className="grid justify-items-end gap-3 max-[700px]:w-full max-[700px]:grid-cols-[1fr_auto] max-[700px]:items-center max-[700px]:justify-items-start">
                        <strong className="text-base text-strong">
                          {currencyFormatter.format(record.costInCents / 100)}
                        </strong>
                        <div className="flex gap-1.5">
                          <IconButton
                            label={t('common.edit')}
                            onClick={() => onEdit(record.id)}
                          >
                            <Pencil aria-hidden="true" className="size-4" />
                          </IconButton>
                          <IconButton
                            label={t('common.delete')}
                            variant="danger"
                            onClick={() => onDelete(record.id)}
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-muted">
                      <span>
                        {dateFormatter.format(
                          new Date(`${record.date}T12:00:00`),
                        )}
                      </span>
                      <span>
                        {formatDistance(record.mileage, distanceUnit, locale)}
                      </span>
                      {record.workshop && <span>{record.workshop}</span>}
                    </div>
                    {record.notes && (
                      <p className="mt-3 mb-0 text-[13px] leading-[1.6] text-muted">
                        {record.notes}
                      </p>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  )
}

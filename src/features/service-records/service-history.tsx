import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, SearchX } from 'lucide-react'
import type { DistanceUnit, ServiceRecord } from '@/types'
import { getIntlLocale } from '@/i18n'
import { IconButton } from '@/components/actions/icon-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ServiceHistoryFilters,
  type CategoryFilter,
  type RecordSort,
} from './service-history-filters'
import { ServiceRecordList } from './service-record-list'

interface ServiceHistoryProps {
  distanceUnit: DistanceUnit
  records: ServiceRecord[]
  editingRecordId: string | null
  onAdd: () => void
  onDelete: (recordId: string) => void
  onEdit: (recordId: string) => void
}

export const ServiceHistory = ({
  distanceUnit,
  records,
  editingRecordId,
  onAdd,
  onDelete,
  onEdit,
}: ServiceHistoryProps) => {
  const { i18n, t } = useTranslation()
  const locale = getIntlLocale(i18n.resolvedLanguage)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [sort, setSort] = useState<RecordSort>('newest')
  const normalizedQuery = query.trim().toLocaleLowerCase(locale)
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
        (normalizedQuery === '' || searchableContent.includes(normalizedQuery))
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
      className={cn(
        'rounded-large border border-border bg-surface p-7 shadow-card max-[700px]:p-[22px]',
      )}
    >
      <div
        className={cn(
          'flex items-start justify-between gap-5',
          'border-b border-border pb-[22px]',
        )}
      >
        <div>
          <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
            {t('history.eyebrow')}
          </p>
          <h2 className="m-0 text-[22px] font-bold tracking-[-0.025em] text-strong">
            {t('history.title')}
          </h2>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Badge variant="secondary">
            {hasActiveFilters && visibleRecords.length !== records.length
              ? t('history.filteredEntries', {
                  visible: visibleRecords.length,
                  total: records.length,
                })
              : t('history.entryCount', { count: records.length })}
          </Badge>
          <IconButton
            label={t('history.add')}
            tooltipSide="bottom"
            variant="primary"
            onClick={onAdd}
          >
            <Plus aria-hidden="true" className="size-4" />
          </IconButton>
        </div>
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
          <Button
            className="mt-5 gap-1.5"
            size="sm"
            variant="secondary"
            type="button"
            onClick={onAdd}
          >
            <Plus aria-hidden="true" className="size-4" />
            {t('history.add')}
          </Button>
        </div>
      ) : (
        <>
          <ServiceHistoryFilters
            category={category}
            query={query}
            sort={sort}
            onCategoryChange={setCategory}
            onQueryChange={setQuery}
            onSortChange={setSort}
          />

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
              <Button
                className="mt-4"
                size="sm"
                variant="secondary"
                type="button"
                onClick={clearFilters}
              >
                {t('history.clearFilters')}
              </Button>
            </div>
          ) : (
            <ServiceRecordList
              distanceUnit={distanceUnit}
              editingRecordId={editingRecordId}
              locale={locale}
              records={visibleRecords}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          )}
        </>
      )}
    </section>
  )
}

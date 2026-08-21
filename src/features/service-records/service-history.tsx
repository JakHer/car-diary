import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, SearchX, Wrench } from 'lucide-react'
import type {
  DistanceUnit,
  ServiceAttachment,
  ServiceRecord,
} from '@/types'
import { getIntlLocale } from '@/i18n'
import { IconButton } from '@/components/actions/icon-button'
import { EmptyState } from '@/components/feedback/empty-state'
import { DashboardSection } from '@/components/layout/dashboard-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ServiceHistoryFilters,
  type CategoryFilter,
  type RecordSort,
} from './service-history-filters'
import { ServiceRecordList } from './service-record-list'

interface ServiceHistoryProps {
  distanceUnit: DistanceUnit
  attachments: ServiceAttachment[]
  deletingAttachmentId: string | null
  records: ServiceRecord[]
  editingRecordId: string | null
  uploadingRecordId: string | null
  onAdd: () => void
  onDelete: (recordId: string) => void
  onDeleteAttachment: (attachmentId: string) => void
  onEdit: (recordId: string) => void
  onUploadAttachment: (recordId: string, file: File) => void
}

export const ServiceHistory = ({
  attachments,
  deletingAttachmentId,
  distanceUnit,
  records,
  editingRecordId,
  uploadingRecordId,
  onAdd,
  onDelete,
  onDeleteAttachment,
  onEdit,
  onUploadAttachment,
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
    <DashboardSection
      actions={
        <>
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
        </>
      }
      eyebrow={t('history.eyebrow')}
      title={t('history.title')}
      titleId="service-history-title"
    >
      {records.length === 0 ? (
        <EmptyState
          description={t('history.emptyDescription')}
          icon={Wrench}
          title={t('history.emptyTitle')}
        />
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
              attachments={attachments}
              deletingAttachmentId={deletingAttachmentId}
              distanceUnit={distanceUnit}
              editingRecordId={editingRecordId}
              locale={locale}
              records={visibleRecords}
              uploadingRecordId={uploadingRecordId}
              onDelete={onDelete}
              onDeleteAttachment={onDeleteAttachment}
              onEdit={onEdit}
              onUploadAttachment={onUploadAttachment}
            />
          )}
        </>
      )}
    </DashboardSection>
  )
}

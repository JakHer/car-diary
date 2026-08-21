import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Fuel, Pencil, Trash2 } from 'lucide-react'
import type { DistanceUnit, FuelAttachment, FuelEntry } from '@/types'
import { formatDistance } from '@/lib/distance-units'
import { IconButton } from '@/components/actions/icon-button'
import { EmptyState } from '@/components/feedback/empty-state'
import { Badge } from '@/components/ui/badge'
import { AttachmentList } from '@/features/attachments/attachment-list'

interface FuelEntryListProps {
  distanceUnit: DistanceUnit
  attachments: FuelAttachment[]
  deletingAttachmentId: string | null
  entries: FuelEntry[]
  locale: string
  uploadingFuelEntryId: string | null
  onDeleteAttachment: (attachmentId: string) => void
  onDelete: (fuelEntryId: string) => void
  onEdit: (fuelEntryId: string) => void
  onUploadAttachment: (fuelEntryId: string, file: File) => void
}

export const FuelEntryList = ({
  attachments,
  deletingAttachmentId,
  distanceUnit,
  entries,
  locale,
  uploadingFuelEntryId,
  onDeleteAttachment,
  onDelete,
  onEdit,
  onUploadAttachment,
}: FuelEntryListProps) => {
  const { t } = useTranslation()
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
  const orderedEntries = entries.toSorted(
    (first, second) =>
      second.date.localeCompare(first.date) || second.mileage - first.mileage,
  )

  if (orderedEntries.length === 0) {
    return (
      <EmptyState
        description={t('fuel.emptyDescription')}
        icon={Fuel}
        title={t('fuel.emptyTitle')}
      />
    )
  }

  return (
    <ol className="m-0 grid list-none gap-2.5 p-0">
      {orderedEntries.map((entry) => {
        const liters = entry.volumeInMilliliters / 1_000
        const pricePerLiter = entry.totalCostInCents / 100 / liters

        return (
          <li
            className="flex items-center justify-between gap-4 rounded-[11px] border border-border bg-surface-muted/35 px-4 py-3.5"
            key={entry.id}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm text-strong">
                  {volumeFormatter.format(liters)} l
                </strong>
                <span className="text-sm font-bold text-strong">
                  {currencyFormatter.format(entry.totalCostInCents / 100)}
                </span>
                {entry.fullTank && (
                  <Badge variant="secondary">{t('fuel.fullTankBadge')}</Badge>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
                <span>
                  {dateFormatter.format(new Date(`${entry.date}T12:00:00`))}
                </span>
                <span>
                  {formatDistance(entry.mileage, distanceUnit, locale)}
                </span>
                <span>
                  {t('fuel.pricePerLiter', {
                    price: currencyFormatter.format(pricePerLiter),
                  })}
                </span>
                {entry.station && <span>{entry.station}</span>}
              </div>
              <AttachmentList
                attachments={attachments.filter(
                  (attachment) => attachment.fuelEntryId === entry.id,
                )}
                deletingAttachmentId={deletingAttachmentId}
                entityId={entry.id}
                isUploading={uploadingFuelEntryId === entry.id}
                onDelete={onDeleteAttachment}
                onUpload={onUploadAttachment}
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <IconButton
                label={t('common.edit')}
                onClick={() => onEdit(entry.id)}
              >
                <Pencil aria-hidden="true" className="size-4" />
              </IconButton>
              <IconButton
                label={t('common.delete')}
                variant="danger"
                onClick={() => onDelete(entry.id)}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </IconButton>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

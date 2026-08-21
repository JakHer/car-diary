import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import type {
  DistanceUnit,
  ServiceAttachment,
  ServiceRecord,
} from '@/types'
import { IconButton } from '@/components/actions/icon-button'
import { Badge } from '@/components/ui/badge'
import { formatDistance } from '@/lib/distance-units'
import { cn } from '@/lib/utils'
import { ServiceAttachments } from './service-attachments'

interface ServiceRecordListProps {
  distanceUnit: DistanceUnit
  attachments: ServiceAttachment[]
  deletingAttachmentId: string | null
  editingRecordId: string | null
  uploadingRecordId: string | null
  locale: string
  records: ServiceRecord[]
  onDelete: (recordId: string) => void
  onDeleteAttachment: (attachmentId: string) => void
  onEdit: (recordId: string) => void
  onUploadAttachment: (recordId: string, file: File) => void
}

export const ServiceRecordList = ({
  attachments,
  deletingAttachmentId,
  distanceUnit,
  editingRecordId,
  locale,
  records,
  uploadingRecordId,
  onDelete,
  onDeleteAttachment,
  onEdit,
  onUploadAttachment,
}: ServiceRecordListProps) => {
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

  return (
    <ol className="m-0 list-none pt-2 pl-0">
      {records.map((record) => (
        <li
          className={cn(
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
                <Badge variant="success">
                  {t(`service.categories.${record.category}`)}
                </Badge>
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
                {dateFormatter.format(new Date(`${record.date}T12:00:00`))}
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
            <ServiceAttachments
              attachments={attachments.filter(
                (attachment) => attachment.serviceRecordId === record.id,
              )}
              deletingAttachmentId={deletingAttachmentId}
              isUploading={uploadingRecordId === record.id}
              recordId={record.id}
              onDelete={onDeleteAttachment}
              onUpload={onUploadAttachment}
            />
          </article>
        </li>
      ))}
    </ol>
  )
}

import { useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Image, Paperclip, Trash2 } from 'lucide-react'
import type { ServiceAttachment } from '@/types'
import { IconButton } from '@/components/actions/icon-button'
import { Loader } from '@/components/feedback/loader'
import { Button } from '@/components/ui/button'
import { serviceAttachmentMimeTypes } from './service-attachment-repository'

interface ServiceAttachmentsProps {
  attachments: ServiceAttachment[]
  deletingAttachmentId: string | null
  isUploading: boolean
  recordId: string
  onDelete: (attachmentId: string) => void
  onUpload: (recordId: string, file: File) => void
}

export const ServiceAttachments = ({
  attachments,
  deletingAttachmentId,
  isUploading,
  recordId,
  onDelete,
  onUpload,
}: ServiceAttachmentsProps) => {
  const { i18n, t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const sizeFormatter = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 1,
  })
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onUpload(recordId, file)
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {attachments.map((attachment) => {
        const FileIcon = attachment.mimeType.startsWith('image/')
          ? Image
          : FileText
        const size =
          attachment.sizeBytes >= 1024 * 1024
            ? t('service.attachmentSizeMb', {
                size: sizeFormatter.format(
                  attachment.sizeBytes / (1024 * 1024),
                ),
              })
            : t('service.attachmentSizeKb', {
                size: sizeFormatter.format(attachment.sizeBytes / 1024),
              })

        return (
          <div className="flex min-w-0 items-center gap-1" key={attachment.id}>
            <Button asChild size="xs" variant="outline">
              <a
                className="max-w-[260px]"
                href={attachment.signedUrl}
                rel="noreferrer"
                target="_blank"
                aria-label={t('service.openAttachment', {
                  name: attachment.fileName,
                })}
              >
                <FileIcon aria-hidden="true" className="size-3.5" />
                <span className="truncate">{attachment.fileName}</span>
                <span className="text-light">{size}</span>
              </a>
            </Button>
            <IconButton
              className="size-7 rounded-md"
              disabled={deletingAttachmentId === attachment.id}
              label={t('service.deleteAttachment', {
                name: attachment.fileName,
              })}
              variant="danger"
              onClick={() => onDelete(attachment.id)}
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
            </IconButton>
          </div>
        )
      })}

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={serviceAttachmentMimeTypes.join(',')}
        aria-label={t('service.selectAttachment')}
        onChange={handleFileChange}
      />
      <Button
        size="xs"
        type="button"
        variant="secondary"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader label={t('service.uploadingAttachment')} size="small" />
        ) : (
          <>
            <Paperclip aria-hidden="true" className="size-3.5" />
            {t('service.addAttachment')}
          </>
        )}
      </Button>
    </div>
  )
}

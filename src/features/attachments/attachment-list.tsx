import { useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Image, Paperclip, Trash2 } from 'lucide-react'
import type { FileAttachment } from '@/types'
import { IconButton } from '@/components/actions/icon-button'
import { Loader } from '@/components/feedback/loader'
import { Button } from '@/components/ui/button'
import { attachmentMimeTypes } from './attachment-storage'

interface AttachmentListProps {
  attachments: FileAttachment[]
  deletingAttachmentId: string | null
  entityId: string
  isUploading: boolean
  onDelete: (attachmentId: string) => void
  onUpload: (entityId: string, file: File) => void
}

export const AttachmentList = ({
  attachments,
  deletingAttachmentId,
  entityId,
  isUploading,
  onDelete,
  onUpload,
}: AttachmentListProps) => {
  const { i18n, t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const sizeFormatter = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 1,
  })
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onUpload(entityId, file)
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {attachments.map((attachment) => {
        const FileIcon = attachment.mimeType.startsWith('image/')
          ? Image
          : FileText
        const size =
          attachment.sizeBytes >= 1024 * 1024
            ? t('attachments.sizeMb', {
                size: sizeFormatter.format(
                  attachment.sizeBytes / (1024 * 1024),
                ),
              })
            : t('attachments.sizeKb', {
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
                aria-label={t('attachments.open', {
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
              label={t('attachments.delete', {
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
        accept={attachmentMimeTypes.join(',')}
        aria-label={t('attachments.select')}
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
          <Loader label={t('attachments.uploading')} size="small" />
        ) : (
          <>
            <Paperclip aria-hidden="true" className="size-3.5" />
            {t('attachments.add')}
          </>
        )}
      </Button>
    </div>
  )
}

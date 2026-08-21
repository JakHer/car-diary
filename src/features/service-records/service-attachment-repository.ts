import type { Database } from '@/database.types'
import type { ServiceAttachment } from '@/types'
import { getSupabaseClient } from '@/lib/supabase'

export const serviceAttachmentBucket = 'service-attachments'
export const serviceAttachmentMaxSize = 10 * 1024 * 1024
export const serviceAttachmentMimeTypes: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export type ServiceAttachmentRow =
  Database['public']['Tables']['service_attachments']['Row']

export type ServiceAttachmentValidationError =
  | 'empty'
  | 'too-large'
  | 'unsupported-type'

export const validateServiceAttachment = (
  file: File,
): ServiceAttachmentValidationError | null => {
  if (file.size === 0) return 'empty'
  if (file.size > serviceAttachmentMaxSize) return 'too-large'
  if (!serviceAttachmentMimeTypes.includes(file.type)) {
    return 'unsupported-type'
  }
  return null
}

const sanitizeFileName = (fileName: string): string => {
  const sanitized = fileName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return sanitized.slice(-120) || 'attachment'
}

const mapServiceAttachment = (
  row: ServiceAttachmentRow,
  signedUrl: string,
): ServiceAttachment => ({
  id: row.id,
  serviceRecordId: row.service_record_id,
  storagePath: row.storage_path,
  fileName: row.file_name,
  mimeType: row.mime_type,
  sizeBytes: row.size_bytes,
  signedUrl,
  createdAt: row.created_at,
})

export const fetchServiceAttachments = async (): Promise<
  ServiceAttachment[]
> => {
  const client = getSupabaseClient()
  const { data: rows, error } = await client
    .from('service_attachments')
    .select()
    .order('created_at', { ascending: true })

  if (error) throw error
  if (rows.length === 0) return []

  const { data: signedUrls, error: signedUrlError } = await client.storage
    .from(serviceAttachmentBucket)
    .createSignedUrls(
      rows.map((row) => row.storage_path),
      60 * 60,
    )

  if (signedUrlError) throw signedUrlError

  const signedUrlByPath = new Map(
    signedUrls.map(({ path, signedUrl }) => [path, signedUrl]),
  )

  return rows.map((row) =>
    mapServiceAttachment(row, signedUrlByPath.get(row.storage_path) ?? ''),
  )
}

export const uploadServiceAttachment = async (
  userId: string,
  serviceRecordId: string,
  file: File,
): Promise<void> => {
  const validationError = validateServiceAttachment(file)
  if (validationError) throw new Error(validationError)

  const client = getSupabaseClient()
  const storagePath = `${userId}/${serviceRecordId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
  const { error: uploadError } = await client.storage
    .from(serviceAttachmentBucket)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { error: metadataError } = await client
    .from('service_attachments')
    .insert({
      service_record_id: serviceRecordId,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    })

  if (!metadataError) return

  await client.storage
    .from(serviceAttachmentBucket)
    .remove([storagePath])
  throw metadataError
}

export const removeServiceAttachmentFiles = async (
  storagePaths: string[],
): Promise<void> => {
  if (storagePaths.length === 0) return

  const { error } = await getSupabaseClient().storage
    .from(serviceAttachmentBucket)
    .remove(storagePaths)

  if (error) throw error
}

export const deleteServiceAttachment = async (
  attachmentId: string,
  storagePath: string,
): Promise<void> => {
  await removeServiceAttachmentFiles([storagePath])

  const { error } = await getSupabaseClient()
    .from('service_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) throw error
}

import { getSupabaseClient } from '@/lib/supabase'

export const attachmentBucket = 'service-attachments'
export const attachmentMaxSize = 10 * 1024 * 1024
export const attachmentMimeTypes: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

export type AttachmentValidationError =
  | 'empty'
  | 'too-large'
  | 'unsupported-type'

export const validateAttachment = (
  file: File,
): AttachmentValidationError | null => {
  if (file.size === 0) return 'empty'
  if (file.size > attachmentMaxSize) return 'too-large'
  if (!attachmentMimeTypes.includes(file.type)) return 'unsupported-type'
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

export const createAttachmentSignedUrls = async (
  storagePaths: string[],
): Promise<Map<string, string>> => {
  if (storagePaths.length === 0) return new Map()

  const { data, error } = await getSupabaseClient().storage
    .from(attachmentBucket)
    .createSignedUrls(storagePaths, 60 * 60)

  if (error) throw error
  const signedUrlByPath = new Map<string, string>()
  data.forEach(({ path, signedUrl }) => {
    if (path && signedUrl) signedUrlByPath.set(path, signedUrl)
  })
  return signedUrlByPath
}

export const uploadAttachmentFile = async (
  userId: string,
  scope: 'fuel-entries' | 'service-records',
  entityId: string,
  file: File,
): Promise<string> => {
  const validationError = validateAttachment(file)
  if (validationError) throw new Error(validationError)

  const storagePath = `${userId}/${scope}/${entityId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`
  const { error } = await getSupabaseClient().storage
    .from(attachmentBucket)
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw error
  return storagePath
}

export const removeAttachmentFiles = async (
  storagePaths: string[],
): Promise<void> => {
  if (storagePaths.length === 0) return

  const { error } = await getSupabaseClient().storage
    .from(attachmentBucket)
    .remove(storagePaths)

  if (error) throw error
}

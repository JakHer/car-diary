import type { Database } from '@/database.types'
import type { FuelAttachment } from '@/types'
import { getSupabaseClient } from '@/lib/supabase'
import {
  createAttachmentSignedUrls,
  removeAttachmentFiles,
  uploadAttachmentFile,
} from '@/features/attachments/attachment-storage'

export type FuelAttachmentRow =
  Database['public']['Tables']['fuel_attachments']['Row']

const mapFuelAttachment = (
  row: FuelAttachmentRow,
  signedUrl: string,
): FuelAttachment => ({
  id: row.id,
  fuelEntryId: row.fuel_entry_id,
  storagePath: row.storage_path,
  fileName: row.file_name,
  mimeType: row.mime_type,
  sizeBytes: row.size_bytes,
  signedUrl,
  createdAt: row.created_at,
})

export const fetchFuelAttachments = async (): Promise<FuelAttachment[]> => {
  const client = getSupabaseClient()
  const { data: rows, error } = await client
    .from('fuel_attachments')
    .select()
    .order('created_at', { ascending: true })

  if (error) throw error
  if (rows.length === 0) return []

  const signedUrlByPath = await createAttachmentSignedUrls(
    rows.map((row) => row.storage_path),
  )

  return rows.map((row) =>
    mapFuelAttachment(row, signedUrlByPath.get(row.storage_path) ?? ''),
  )
}

export const uploadFuelAttachment = async (
  userId: string,
  fuelEntryId: string,
  file: File,
): Promise<void> => {
  const client = getSupabaseClient()
  const storagePath = await uploadAttachmentFile(
    userId,
    'fuel-entries',
    fuelEntryId,
    file,
  )
  const { error } = await client.from('fuel_attachments').insert({
    fuel_entry_id: fuelEntryId,
    storage_path: storagePath,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
  })

  if (!error) return

  await removeAttachmentFiles([storagePath])
  throw error
}

export const deleteFuelAttachment = async (
  attachmentId: string,
  storagePath: string,
): Promise<void> => {
  await removeAttachmentFiles([storagePath])

  const { error } = await getSupabaseClient()
    .from('fuel_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) throw error
}

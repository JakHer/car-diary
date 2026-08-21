import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deleteFuelAttachment,
  fetchFuelAttachments,
  uploadFuelAttachment,
} from './fuel-attachment-repository'

const supabase = vi.hoisted(() => ({
  from: vi.fn(),
  storageFrom: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: supabase.from,
    storage: { from: supabase.storageFrom },
  }),
}))

describe('fuel attachment repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches fuel attachment metadata with private URLs', async () => {
    const row = {
      id: 'attachment-1',
      fuel_entry_id: 'fuel-1',
      storage_path: 'user-1/fuel-entries/fuel-1/receipt.pdf',
      file_name: 'receipt.pdf',
      mime_type: 'application/pdf',
      size_bytes: 2048,
      created_at: '2026-08-21T10:00:00.000Z',
    }
    const order = vi.fn().mockResolvedValue({ data: [row], error: null })
    const select = vi.fn().mockReturnValue({ order })
    const createSignedUrls = vi.fn().mockResolvedValue({
      data: [
        {
          path: row.storage_path,
          signedUrl: 'https://example.com/signed-receipt',
        },
      ],
      error: null,
    })
    supabase.from.mockReturnValue({ select })
    supabase.storageFrom.mockReturnValue({ createSignedUrls })

    await expect(fetchFuelAttachments()).resolves.toEqual([
      expect.objectContaining({
        fuelEntryId: 'fuel-1',
        fileName: 'receipt.pdf',
        signedUrl: 'https://example.com/signed-receipt',
      }),
    ])
  })

  it('uploads a receipt and saves its fuel entry metadata', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const remove = vi.fn().mockResolvedValue({ error: null })
    const insert = vi.fn().mockResolvedValue({ error: null })
    supabase.storageFrom.mockReturnValue({ upload, remove })
    supabase.from.mockReturnValue({ insert })
    const file = new File(['receipt'], 'fuel receipt.pdf', {
      type: 'application/pdf',
    })

    await uploadFuelAttachment('user-1', 'fuel-1', file)

    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(
        /^user-1\/fuel-entries\/fuel-1\/[a-f0-9-]+-fuel-receipt\.pdf$/,
      ),
      file,
      { contentType: 'application/pdf', upsert: false },
    )
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        fuel_entry_id: 'fuel-1',
        file_name: 'fuel receipt.pdf',
      }),
    )
  })

  it('removes the stored receipt and metadata', async () => {
    const remove = vi.fn().mockResolvedValue({ error: null })
    const eq = vi.fn().mockResolvedValue({ error: null })
    const deleteQuery = vi.fn().mockReturnValue({ eq })
    supabase.storageFrom.mockReturnValue({ remove })
    supabase.from.mockReturnValue({ delete: deleteQuery })

    await deleteFuelAttachment(
      'attachment-1',
      'user-1/fuel-entries/fuel-1/receipt.pdf',
    )

    expect(remove).toHaveBeenCalledWith([
      'user-1/fuel-entries/fuel-1/receipt.pdf',
    ])
    expect(eq).toHaveBeenCalledWith('id', 'attachment-1')
  })
})

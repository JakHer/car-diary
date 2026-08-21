import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deleteServiceAttachment,
  fetchServiceAttachments,
  uploadServiceAttachment,
  validateServiceAttachment,
} from './service-attachment-repository'

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

describe('service attachment repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches metadata and adds private signed URLs', async () => {
    const rows = [
      {
        id: 'attachment-1',
        service_record_id: 'record-1',
        storage_path: 'user-1/record-1/receipt.pdf',
        file_name: 'receipt.pdf',
        mime_type: 'application/pdf',
        size_bytes: 2048,
        created_at: '2026-08-21T10:00:00.000Z',
      },
    ]
    const order = vi.fn().mockResolvedValue({ data: rows, error: null })
    const select = vi.fn().mockReturnValue({ order })
    const createSignedUrls = vi.fn().mockResolvedValue({
      data: [
        {
          path: rows[0].storage_path,
          signedUrl: 'https://example.com/signed-receipt',
        },
      ],
      error: null,
    })
    supabase.from.mockReturnValue({ select })
    supabase.storageFrom.mockReturnValue({ createSignedUrls })

    await expect(fetchServiceAttachments()).resolves.toEqual([
      {
        id: 'attachment-1',
        serviceRecordId: 'record-1',
        storagePath: rows[0].storage_path,
        fileName: 'receipt.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2048,
        signedUrl: 'https://example.com/signed-receipt',
        createdAt: '2026-08-21T10:00:00.000Z',
      },
    ])
    expect(createSignedUrls).toHaveBeenCalledWith([rows[0].storage_path], 3600)
  })

  it('uploads a private file and saves its metadata', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const remove = vi.fn().mockResolvedValue({ error: null })
    const insert = vi.fn().mockResolvedValue({ error: null })
    supabase.storageFrom.mockReturnValue({ upload, remove })
    supabase.from.mockReturnValue({ insert })
    const file = new File(['receipt'], 'oil receipt.pdf', {
      type: 'application/pdf',
    })

    await uploadServiceAttachment('user-1', 'record-1', file)

    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(
        /^user-1\/record-1\/[a-f0-9-]+-oil-receipt\.pdf$/,
      ),
      file,
      { contentType: 'application/pdf', upsert: false },
    )
    const storagePath = upload.mock.calls[0]?.[0]
    expect(insert).toHaveBeenCalledWith({
      service_record_id: 'record-1',
      storage_path: storagePath,
      file_name: 'oil receipt.pdf',
      mime_type: 'application/pdf',
      size_bytes: file.size,
    })
    expect(remove).not.toHaveBeenCalled()
  })

  it('removes the object and its metadata', async () => {
    const remove = vi.fn().mockResolvedValue({ error: null })
    const eq = vi.fn().mockResolvedValue({ error: null })
    const deleteQuery = vi.fn().mockReturnValue({ eq })
    supabase.storageFrom.mockReturnValue({ remove })
    supabase.from.mockReturnValue({ delete: deleteQuery })

    await deleteServiceAttachment(
      'attachment-1',
      'user-1/record-1/receipt.pdf',
    )

    expect(remove).toHaveBeenCalledWith(['user-1/record-1/receipt.pdf'])
    expect(eq).toHaveBeenCalledWith('id', 'attachment-1')
  })

  it('rejects unsupported and oversized files', () => {
    expect(
      validateServiceAttachment(
        new File(['text'], 'notes.txt', { type: 'text/plain' }),
      ),
    ).toBe('unsupported-type')
    expect(
      validateServiceAttachment(
        new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf', {
          type: 'application/pdf',
        }),
      ),
    ).toBe('too-large')
  })
})

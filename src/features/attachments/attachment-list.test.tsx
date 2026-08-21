import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FileAttachment } from '@/types'
import { AttachmentList } from './attachment-list'

const attachment: FileAttachment = {
  id: 'attachment-1',
  storagePath: 'user-1/service-records/record-1/receipt.pdf',
  fileName: 'receipt.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 2048,
  signedUrl: 'https://example.com/signed-receipt',
  createdAt: '2026-08-21T10:00:00.000Z',
}

describe('AttachmentList', () => {
  it('uploads, opens and deletes attachments with accessible controls', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onUpload = vi.fn()
    render(
      <AttachmentList
        attachments={[attachment]}
        deletingAttachmentId={null}
        entityId="record-1"
        isUploading={false}
        onDelete={onDelete}
        onUpload={onUpload}
      />,
    )

    expect(screen.getByRole('link', { name: 'Open receipt.pdf' })).toHaveAttribute(
      'href',
      attachment.signedUrl,
    )
    await user.click(screen.getByRole('button', { name: 'Delete receipt.pdf' }))
    expect(onDelete).toHaveBeenCalledWith('attachment-1')

    const file = new File(['receipt'], 'new-receipt.pdf', {
      type: 'application/pdf',
    })
    await user.upload(screen.getByLabelText('Select an attachment'), file)
    expect(onUpload).toHaveBeenCalledWith('record-1', file)
  })
})

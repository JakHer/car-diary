import { describe, expect, it } from 'vitest'
import { validateAttachment } from './attachment-storage'

describe('attachment storage validation', () => {
  it('rejects unsupported and oversized files', () => {
    expect(
      validateAttachment(
        new File(['text'], 'notes.txt', { type: 'text/plain' }),
      ),
    ).toBe('unsupported-type')

    const largeFile = new File(['content'], 'large.pdf', {
      type: 'application/pdf',
    })
    Object.defineProperty(largeFile, 'size', { value: 10 * 1024 * 1024 + 1 })
    expect(validateAttachment(largeFile)).toBe('too-large')
  })
})

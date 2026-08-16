import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDeleteConfirmation } from './use-delete-confirmation'

describe('useDeleteConfirmation', () => {
  it('opens, confirms and closes a deletion request', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteConfirmation())

    act(() => {
      result.current.requestDeletion({
        description: 'This cannot be undone.',
        title: 'Delete entry?',
        onConfirm,
      })
    })

    expect(result.current.confirmation?.title).toBe('Delete entry?')

    act(() => result.current.confirmDeletion())

    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce())
    await waitFor(() => expect(result.current.confirmation).toBeNull())
    expect(result.current.isConfirming).toBe(false)
  })

  it('closes a request without running its action', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteConfirmation())

    act(() => {
      result.current.requestDeletion({
        description: 'This cannot be undone.',
        title: 'Delete entry?',
        onConfirm,
      })
      result.current.closeDeleteConfirmation()
    })

    expect(result.current.confirmation).toBeNull()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: toastMocks,
}))

import { appToast } from './app-toast'

describe('appToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an error toast with an optional description', () => {
    appToast.error('Could not sign out.', 'Network unavailable')

    expect(toastMocks.error).toHaveBeenCalledWith('Could not sign out.', {
      description: 'Network unavailable',
    })
  })

  it('shows a success toast', () => {
    appToast.success('Saved')

    expect(toastMocks.success).toHaveBeenCalledWith('Saved', {
      description: undefined,
    })
  })
})

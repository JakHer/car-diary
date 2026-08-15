import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('shows the confirmation and allows cancelling', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <ConfirmDialog
        description="This action cannot be undone."
        open
        title="Delete service record?"
        onConfirm={vi.fn()}
        onOpenChange={onOpenChange}
      />,
    )

    expect(
      screen.getByRole('alertdialog', { name: 'Delete service record?' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('locks both actions while deleting', () => {
    render(
      <ConfirmDialog
        description="This action cannot be undone."
        isConfirming
        open
        title="Delete service record?"
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Deleting...' }),
    ).toBeDisabled()
  })
})

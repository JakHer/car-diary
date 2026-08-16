import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { Pencil } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('shows an accessible tooltip on hover', async () => {
    const user = userEvent.setup()

    render(
      <IconButton label="Edit vehicle">
        <Pencil aria-hidden="true" />
      </IconButton>,
    )

    await user.hover(screen.getByRole('button', { name: 'Edit vehicle' }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Edit vehicle')
  })
})

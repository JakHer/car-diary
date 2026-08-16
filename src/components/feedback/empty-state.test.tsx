import { render, screen } from '@testing-library/react'
import { Fuel } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders its title and description', () => {
    render(
      <EmptyState
        description="Start tracking fuel costs."
        icon={Fuel}
        title="No fill-ups yet"
      />,
    )

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'No fill-ups yet',
    )
    expect(screen.getByText('Start tracking fuel costs.')).toBeInTheDocument()
  })
})

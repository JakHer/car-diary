import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AuthScreen } from './auth-screen'

describe('AuthScreen', () => {
  it('switches between sign-in and sign-up modes', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <AuthScreen />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Sign in to Car Diary' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'current-password',
    )

    await user.click(screen.getByRole('button', { name: 'Create one' }))

    expect(
      screen.getByRole('heading', { name: 'Start your diary' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
    expect(
      screen.getByRole('button', { name: 'Create account' }),
    ).toBeInTheDocument()
  })
})

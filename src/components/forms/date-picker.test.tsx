import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker } from './date-picker'

describe('DatePicker', () => {
  it('stores the selected date as an ISO form value', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(Object.fromEntries(new FormData(event.currentTarget)))
        }}
      >
        <DatePicker
          defaultValue="2026-08-15"
          name="serviceDate"
          required
        />
        <button type="submit">Submit</button>
      </form>,
    )

    await user.click(screen.getByRole('button', { name: 'Change date' }))
    await user.click(
      screen.getByRole('button', { name: 'Thursday, 20 August 2026' }),
    )
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(onSubmit).toHaveBeenCalledWith({ serviceDate: '2026-08-20' })
  })
})

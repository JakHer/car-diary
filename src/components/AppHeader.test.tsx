import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import type { Vehicle } from '../types'
import { AppHeader } from './AppHeader'

const vehicle: Vehicle = {
  id: 'vehicle-1',
  make: 'Audi',
  model: 'RS3',
  year: 2024,
  registrationNumber: '',
  vin: '',
  distanceUnit: 'km',
  startingMileage: 10_000,
  currentMileage: 10_000,
  createdAt: '2026-08-16T00:00:00Z',
}

describe('AppHeader', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('exposes icon actions with accessible names', async () => {
    const user = userEvent.setup()
    const onAddVehicle = vi.fn()
    const onSignOut = vi.fn().mockResolvedValue(undefined)

    render(
      <MemoryRouter>
        <AppHeader
          activeVehicle={vehicle}
          userEmail="driver@example.com"
          vehicles={[vehicle]}
          onAddVehicle={onAddVehicle}
          onSelectVehicle={vi.fn()}
          onSignOut={onSignOut}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Add vehicle' }))
    await user.click(screen.getByRole('button', { name: 'Sign out' }))
    await user.hover(screen.getByText('driver@example.com'))

    expect(onAddVehicle).toHaveBeenCalledOnce()
    expect(onSignOut).toHaveBeenCalledOnce()
    expect(
      screen.getByRole('link', { name: 'Settings' }),
    ).toHaveAttribute('href', '/settings')
    expect(
      screen.getByRole('link', { name: 'Car Diary home page' }),
    ).toHaveAttribute('href', '/vehicles/vehicle-1')
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'driver@example.com',
    )
  })
})

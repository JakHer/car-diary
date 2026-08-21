import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { VehicleSectionNavigation } from './vehicle-section-navigation'

describe('VehicleSectionNavigation', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('links every section to the selected vehicle', () => {
    render(
      <MemoryRouter initialEntries={['/vehicles/vehicle-1/fuel']}>
        <VehicleSectionNavigation vehicleId="vehicle-1" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      '/vehicles/vehicle-1',
    )
    expect(screen.getByRole('link', { name: 'Service' })).toHaveAttribute(
      'href',
      '/vehicles/vehicle-1/service',
    )
    expect(screen.getByRole('link', { name: 'Fuel' })).toHaveAttribute(
      'href',
      '/vehicles/vehicle-1/fuel',
    )
    expect(screen.getByRole('link', { name: 'Fuel' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Reminders' })).toHaveAttribute(
      'href',
      '/vehicles/vehicle-1/reminders',
    )
  })
})

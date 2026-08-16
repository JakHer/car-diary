import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ServiceRecord } from '../types'
import { ServiceHistory } from './ServiceHistory'

const records: ServiceRecord[] = [
  {
    id: 'inspection',
    vehicleId: 'vehicle-1',
    title: 'Annual inspection',
    category: 'Inspection',
    date: '2025-12-10',
    mileage: 70_000,
    workshop: 'City inspection station',
    costInCents: 30_000,
    notes: '',
    createdAt: '2025-12-10T12:00:00.000Z',
  },
  {
    id: 'oil',
    vehicleId: 'vehicle-1',
    title: 'Engine oil change',
    category: 'Maintenance',
    date: '2026-08-15',
    mileage: 90_000,
    workshop: 'Fast Garage',
    costInCents: 50_000,
    notes: 'Synthetic oil',
    createdAt: '2026-08-15T12:00:00.000Z',
  },
  {
    id: 'brakes',
    vehicleId: 'vehicle-1',
    title: 'Brake pad replacement',
    category: 'Repair',
    date: '2026-07-20',
    mileage: 85_000,
    workshop: 'Volvo dealer',
    costInCents: 150_000,
    notes: '',
    createdAt: '2026-07-20T12:00:00.000Z',
  },
]

const renderHistory = () =>
  render(
    <ServiceHistory
      distanceUnit="km"
      editingRecordId={null}
      records={records}
      onDelete={vi.fn()}
      onEdit={vi.fn()}
    />,
  )

const getRecordTitles = () =>
  screen
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent)

describe('ServiceHistory filters', () => {
  it('searches record details and clears the result', async () => {
    const user = userEvent.setup()
    renderHistory()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search service history' }),
      'dealer',
    )

    expect(getRecordTitles()).toEqual(['Brake pad replacement'])
    expect(screen.getByText('1 of 3 entries')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(getRecordTitles()).toHaveLength(3)
  })

  it('filters records by category', async () => {
    const user = userEvent.setup()
    renderHistory()

    await user.click(
      screen.getByRole('combobox', { name: 'Filter by category' }),
    )
    await user.click(screen.getByRole('option', { name: 'Inspection' }))

    expect(getRecordTitles()).toEqual(['Annual inspection'])
  })

  it('sorts records by cost', async () => {
    const user = userEvent.setup()
    renderHistory()

    await user.click(
      screen.getByRole('combobox', { name: 'Sort service history' }),
    )
    await user.click(screen.getByRole('option', { name: 'Highest cost' }))

    expect(getRecordTitles()).toEqual([
      'Brake pad replacement',
      'Engine oil change',
      'Annual inspection',
    ])
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import type { FuelAttachment, FuelEntry } from '@/types'
import { FuelLog } from './fuel-log'

const entry: FuelEntry = {
  id: 'fuel-1',
  vehicleId: 'vehicle-1',
  date: '2026-08-16',
  mileage: 86_500,
  volumeInMilliliters: 42_750,
  totalCostInCents: 27_500,
  station: 'Orlen',
  fullTank: true,
  createdAt: '2026-08-16T12:00:00.000Z',
}

const attachment: FuelAttachment = {
  id: 'attachment-1',
  fuelEntryId: 'fuel-1',
  storagePath: 'user-1/fuel-entries/fuel-1/receipt.pdf',
  fileName: 'fuel-receipt.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 2048,
  signedUrl: 'https://example.com/signed-fuel-receipt',
  createdAt: '2026-08-21T10:00:00.000Z',
}

describe('FuelLog', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('creates a fuel entry in integer storage units', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)

    render(
      <FuelLog
        attachments={[]}
        currentMileage={86_200}
        deletingAttachmentId={null}
        distanceUnit="km"
        entries={[]}
        isSaving={false}
        uploadingFuelEntryId={null}
        onCreate={onCreate}
        onDelete={vi.fn()}
        onDeleteAttachment={vi.fn()}
        onUpdate={vi.fn()}
        onUploadAttachment={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add fill-up' }))
    await user.clear(screen.getByRole('spinbutton', { name: 'Fuel (liters)' }))
    await user.type(
      screen.getByRole('spinbutton', { name: 'Fuel (liters)' }),
      '42.75',
    )
    await user.type(
      screen.getByRole('spinbutton', { name: 'Total cost (PLN)' }),
      '275',
    )
    await user.type(screen.getByRole('textbox', { name: 'Station' }), 'Orlen')
    await user.click(screen.getByRole('checkbox', { name: 'Filled to full' }))
    await user.click(screen.getByRole('button', { name: 'Add fill-up' }))

    await waitFor(() => expect(onCreate).toHaveBeenCalledOnce())
    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mileage: 86_200,
        volumeInMilliliters: 42_750,
        totalCostInCents: 27_500,
        station: 'Orlen',
        fullTank: true,
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: 'Add fill-up' }))
    expect(screen.getByRole('spinbutton', { name: 'Fuel (liters)' })).toHaveValue(null)
    expect(
      screen.getByRole('spinbutton', { name: 'Total cost (PLN)' }),
    ).toHaveValue(null)
    expect(screen.getByRole('textbox', { name: 'Station' })).toHaveValue('')
    expect(
      screen.getByRole('checkbox', { name: 'Filled to full' }),
    ).not.toBeChecked()
  })

  it('shows a saved fill-up and allows deleting it', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()

    render(
      <FuelLog
        attachments={[]}
        currentMileage={86_500}
        deletingAttachmentId={null}
        distanceUnit="km"
        entries={[entry]}
        isSaving={false}
        uploadingFuelEntryId={null}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onDelete={onDelete}
        onDeleteAttachment={vi.fn()}
        onUpdate={vi.fn()}
        onUploadAttachment={vi.fn()}
      />,
    )

    expect(screen.getByText('42.75 l')).toBeVisible()
    expect(screen.getByText('Orlen')).toBeVisible()
    expect(screen.getByText('Full tank')).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith('fuel-1')
  })

  it('edits a saved fill-up with its existing values', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    render(
      <FuelLog
        attachments={[]}
        currentMileage={90_000}
        deletingAttachmentId={null}
        distanceUnit="km"
        entries={[entry]}
        isSaving={false}
        uploadingFuelEntryId={null}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onDelete={vi.fn()}
        onDeleteAttachment={vi.fn()}
        onUpdate={onUpdate}
        onUploadAttachment={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('heading', { name: 'Edit fill-up' })).toBeVisible()
    expect(screen.getByRole('spinbutton', { name: 'Mileage (km)' })).toHaveValue(
      86_500,
    )
    expect(screen.getByRole('spinbutton', { name: 'Fuel (liters)' })).toHaveValue(
      42.75,
    )
    expect(screen.getByRole('textbox', { name: 'Station' })).toHaveValue(
      'Orlen',
    )

    await user.clear(screen.getByRole('textbox', { name: 'Station' }))
    await user.type(screen.getByRole('textbox', { name: 'Station' }), 'Shell')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(onUpdate).toHaveBeenCalledOnce())
    expect(onUpdate).toHaveBeenCalledWith(
      'fuel-1',
      expect.objectContaining({
        date: '2026-08-16',
        mileage: 86_500,
        volumeInMilliliters: 42_750,
        totalCostInCents: 27_500,
        station: 'Shell',
        fullTank: true,
      }),
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('shows average consumption from complete full-tank cycles', () => {
    const currentYear = new Date().getFullYear()

    render(
      <FuelLog
        attachments={[]}
        currentMileage={86_500}
        deletingAttachmentId={null}
        distanceUnit="km"
        entries={[
          {
            ...entry,
            id: 'fuel-1',
            date: `${currentYear}-08-15`,
            mileage: 86_000,
          },
          {
            ...entry,
            id: 'fuel-2',
            date: `${currentYear}-08-16`,
            mileage: 86_500,
            volumeInMilliliters: 50_000,
          },
        ]}
        isSaving={false}
        uploadingFuelEntryId={null}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onDelete={vi.fn()}
        onDeleteAttachment={vi.fn()}
        onUpdate={vi.fn()}
        onUploadAttachment={vi.fn()}
      />,
    )

    expect(screen.getByText('10.0 l/100 km')).toBeVisible()
    expect(screen.getByText(/PLN\s?55\.00\/100 km/)).toBeVisible()
    expect(screen.getByText('500 km')).toBeVisible()
  })

  it('shows and uploads receipts for a saved fill-up', async () => {
    const user = userEvent.setup()
    const onUploadAttachment = vi.fn()
    render(
      <FuelLog
        attachments={[attachment]}
        currentMileage={86_500}
        deletingAttachmentId={null}
        distanceUnit="km"
        entries={[entry]}
        isSaving={false}
        uploadingFuelEntryId={null}
        onCreate={vi.fn().mockResolvedValue(undefined)}
        onDelete={vi.fn()}
        onDeleteAttachment={vi.fn()}
        onUpdate={vi.fn()}
        onUploadAttachment={onUploadAttachment}
      />,
    )

    expect(
      screen.getByRole('link', { name: 'Open fuel-receipt.pdf' }),
    ).toHaveAttribute('href', attachment.signedUrl)

    const file = new File(['new receipt'], 'new-fuel-receipt.pdf', {
      type: 'application/pdf',
    })
    await user.upload(screen.getByLabelText('Select an attachment'), file)
    expect(onUploadAttachment).toHaveBeenCalledWith('fuel-1', file)
  })
})

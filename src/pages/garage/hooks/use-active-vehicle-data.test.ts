import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CarDiaryState, Vehicle } from '@/types'
import { useActiveVehicleData } from './use-active-vehicle-data'

const createVehicle = (id: string): Vehicle => ({
  id,
  make: id === 'vehicle-1' ? 'Audi' : 'Volvo',
  model: id === 'vehicle-1' ? 'RS3' : 'V60',
  year: 2022,
  registrationNumber: '',
  vin: '',
  insurerName: '',
  policyNumber: '',
  assistancePhone: '',
  distanceUnit: 'km',
  startingMileage: 10_000,
  currentMileage: 20_000,
  createdAt: '2026-01-01T00:00:00.000Z',
})

const state: CarDiaryState = {
  version: 6,
  vehicles: [createVehicle('vehicle-1'), createVehicle('vehicle-2')],
  activeVehicleId: null,
  serviceRecords: [
    {
      id: 'record-older',
      vehicleId: 'vehicle-2',
      title: 'Older',
      category: 'Maintenance',
      date: '2026-01-01',
      mileage: 10_000,
      workshop: '',
      costInCents: 0,
      notes: '',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'record-newer',
      vehicleId: 'vehicle-2',
      title: 'Newer',
      category: 'Repair',
      date: '2026-02-01',
      mileage: 12_000,
      workshop: '',
      costInCents: 0,
      notes: '',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ],
  serviceAttachments: [
    {
      id: 'service-attachment',
      serviceRecordId: 'record-newer',
      storagePath: 'service.pdf',
      fileName: 'service.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 100,
      signedUrl: 'https://example.com/service.pdf',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ],
  fuelEntries: [
    {
      id: 'fuel-1',
      vehicleId: 'vehicle-2',
      date: '2026-02-02',
      mileage: 12_100,
      volumeInMilliliters: 40_000,
      totalCostInCents: 25_000,
      station: '',
      fullTank: true,
      createdAt: '2026-02-02T00:00:00.000Z',
    },
  ],
  fuelAttachments: [
    {
      id: 'fuel-attachment',
      fuelEntryId: 'fuel-1',
      storagePath: 'fuel.pdf',
      fileName: 'fuel.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 100,
      signedUrl: 'https://example.com/fuel.pdf',
      createdAt: '2026-02-02T00:00:00.000Z',
    },
  ],
  odometerReadings: [
    {
      id: 'reading-1',
      vehicleId: 'vehicle-2',
      date: '2026-02-02',
      mileage: 12_100,
      source: 'fuel',
      sourceId: 'fuel-1',
      createdAt: '2026-02-02T00:00:00.000Z',
    },
  ],
  maintenanceReminders: [
    {
      id: 'reminder-1',
      vehicleId: 'vehicle-2',
      title: 'Oil',
      dueDate: '2026-03-01',
      dueMileage: null,
      completedAt: null,
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ],
}

describe('useActiveVehicleData', () => {
  it('selects and filters all data for the active vehicle', () => {
    const { result } = renderHook(() =>
      useActiveVehicleData({
        selectedVehicleId: 'vehicle-2',
        state,
      }),
    )

    expect(result.current.activeVehicle?.id).toBe('vehicle-2')
    expect(result.current.records.map(({ id }) => id)).toEqual([
      'record-newer',
      'record-older',
    ])
    expect(result.current.reminders).toHaveLength(1)
    expect(result.current.fuelEntries).toHaveLength(1)
    expect(result.current.attachments).toHaveLength(1)
    expect(result.current.fuelAttachments).toHaveLength(1)
    expect(result.current.odometerReadings).toHaveLength(1)
  })

  it('gives the URL vehicle priority and rejects an unknown route vehicle', () => {
    const { result, rerender } = renderHook(
      ({ routeVehicleId }: { routeVehicleId?: string }) =>
        useActiveVehicleData({
          routeVehicleId,
          selectedVehicleId: 'vehicle-2',
          state,
        }),
      { initialProps: { routeVehicleId: 'vehicle-1' } },
    )

    expect(result.current.activeVehicle?.id).toBe('vehicle-1')

    rerender({ routeVehicleId: 'missing' })

    expect(result.current.activeVehicle).toBeUndefined()
  })
})

import { describe, expect, it } from 'vitest'
import {
  mapCarDiaryState,
} from './car-diary-repository'
import type { VehicleRow } from '@/features/vehicles/vehicle-repository'
import type { ServiceRecordRow } from '@/features/service-records/service-record-repository'
import type { FuelEntryRow } from '@/features/fuel/fuel-repository'
import type { MaintenanceReminderRow } from '@/features/reminders/reminder-repository'
import type { FuelAttachment, ServiceAttachment } from '@/types'

const vehicleRows: VehicleRow[] = [
  {
    id: 'vehicle-1',
    user_id: 'user-1',
    make: 'Volvo',
    model: 'V60',
    year: 2021,
    registration_number: 'WX 1234A',
    vin: '',
    starting_mileage: 80_000,
    current_mileage: 86_200,
    distance_unit: 'km',
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'vehicle-2',
    user_id: 'user-1',
    make: 'Ford',
    model: 'Focus',
    year: 2020,
    registration_number: '',
    vin: '',
    starting_mileage: 40_000,
    current_mileage: 40_000,
    distance_unit: 'mi',
    created_at: '2026-08-02T10:00:00.000Z',
    updated_at: '2026-08-02T10:00:00.000Z',
  },
]

const serviceRecordRows: ServiceRecordRow[] = [
  {
    id: 'record-1',
    vehicle_id: 'vehicle-1',
    title: 'Oil service',
    category: 'Maintenance',
    service_date: '2026-08-10',
    mileage: 84_500,
    workshop: 'North Garage',
    cost_in_cents: 64_990,
    notes: 'Oil and filter changed.',
    created_at: '2026-08-10T12:00:00.000Z',
    updated_at: '2026-08-10T12:00:00.000Z',
  },
  {
    id: 'record-2',
    vehicle_id: 'vehicle-1',
    title: 'Brake inspection',
    category: 'Inspection',
    service_date: '2026-08-12',
    mileage: 86_200,
    workshop: '',
    cost_in_cents: 20_000,
    notes: '',
    created_at: '2026-08-12T12:00:00.000Z',
    updated_at: '2026-08-12T12:00:00.000Z',
  },
]

const reminderRows: MaintenanceReminderRow[] = [
  {
    id: 'reminder-1',
    vehicle_id: 'vehicle-1',
    title: 'Replace timing belt',
    due_date: '2026-10-01',
    due_mileage: 100_000,
    completed_at: null,
    created_at: '2026-08-15T10:00:00.000Z',
    updated_at: '2026-08-15T10:00:00.000Z',
  },
]

const fuelEntryRows: FuelEntryRow[] = [
  {
    id: 'fuel-1',
    vehicle_id: 'vehicle-1',
    fueled_at: '2026-08-16',
    mileage: 86_500,
    volume_milliliters: 42_750,
    total_cost_in_cents: 27_500,
    station: 'Orlen',
    full_tank: true,
    created_at: '2026-08-16T12:00:00.000Z',
    updated_at: '2026-08-16T12:00:00.000Z',
  },
]

const serviceAttachments: ServiceAttachment[] = [
  {
    id: 'attachment-1',
    serviceRecordId: 'record-1',
    storagePath: 'user-1/record-1/receipt.pdf',
    fileName: 'receipt.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 2048,
    signedUrl: 'https://example.com/signed-receipt',
    createdAt: '2026-08-21T10:00:00.000Z',
  },
]

const fuelAttachments: FuelAttachment[] = [
  {
    id: 'fuel-attachment-1',
    fuelEntryId: 'fuel-1',
    storagePath: 'user-1/fuel-entries/fuel-1/receipt.pdf',
    fileName: 'fuel-receipt.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    signedUrl: 'https://example.com/signed-fuel-receipt',
    createdAt: '2026-08-21T11:00:00.000Z',
  },
]

describe('mapCarDiaryState', () => {
  it('maps database rows including the persisted current mileage', () => {
    const state = mapCarDiaryState(
      vehicleRows,
      serviceRecordRows,
      reminderRows,
      fuelEntryRows,
      serviceAttachments,
      fuelAttachments,
    )

    expect(state.activeVehicleId).toBe('vehicle-1')
    expect(state.version).toBe(5)
    expect(state.vehicles).toHaveLength(2)
    expect(state.vehicles[0]).toMatchObject({
      make: 'Volvo',
      registrationNumber: 'WX 1234A',
      startingMileage: 80_000,
      currentMileage: 86_200,
      distanceUnit: 'km',
    })
    expect(state.vehicles[1]).toMatchObject({
      currentMileage: 40_000,
      distanceUnit: 'mi',
    })
    expect(state.serviceRecords[0]).toMatchObject({
      vehicleId: 'vehicle-1',
      category: 'Maintenance',
      date: '2026-08-10',
      costInCents: 64_990,
    })
    expect(state.maintenanceReminders[0]).toMatchObject({
      vehicleId: 'vehicle-1',
      title: 'Replace timing belt',
      dueDate: '2026-10-01',
      dueMileage: 100_000,
      completedAt: null,
    })
    expect(state.fuelEntries[0]).toMatchObject({
      vehicleId: 'vehicle-1',
      date: '2026-08-16',
      mileage: 86_500,
      volumeInMilliliters: 42_750,
      totalCostInCents: 27_500,
      station: 'Orlen',
      fullTank: true,
    })
    expect(state.serviceAttachments[0]).toMatchObject({
      serviceRecordId: 'record-1',
      fileName: 'receipt.pdf',
      signedUrl: 'https://example.com/signed-receipt',
    })
    expect(state.fuelAttachments[0]).toMatchObject({
      fuelEntryId: 'fuel-1',
      fileName: 'fuel-receipt.pdf',
    })
  })

  it('rejects service categories outside the supported domain', () => {
    expect(() =>
      mapCarDiaryState(vehicleRows, [
        { ...serviceRecordRows[0], category: 'Unsupported' },
      ]),
    ).toThrow('Unknown service category: Unsupported')
  })
})

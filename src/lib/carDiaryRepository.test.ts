import { describe, expect, it } from 'vitest'
import {
  mapCarDiaryState,
  type MaintenanceReminderRow,
  type ServiceRecordRow,
  type VehicleRow,
} from './carDiaryRepository'

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

describe('mapCarDiaryState', () => {
  it('maps database rows including the persisted current mileage', () => {
    const state = mapCarDiaryState(
      vehicleRows,
      serviceRecordRows,
      reminderRows,
    )

    expect(state.activeVehicleId).toBe('vehicle-1')
    expect(state.vehicles).toHaveLength(2)
    expect(state.vehicles[0]).toMatchObject({
      make: 'Volvo',
      registrationNumber: 'WX 1234A',
      startingMileage: 80_000,
      currentMileage: 86_200,
    })
    expect(state.vehicles[1]?.currentMileage).toBe(40_000)
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
  })

  it('rejects service categories outside the supported domain', () => {
    expect(() =>
      mapCarDiaryState(vehicleRows, [
        { ...serviceRecordRows[0], category: 'Unsupported' },
      ]),
    ).toThrow('Unknown service category: Unsupported')
  })
})

import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CarDiaryState, FuelEntryInput, VehicleInput } from '../types'
import { useCarDiary } from './use-car-diary'

const repositoryMocks = vi.hoisted(() => ({
  createFuelEntry: vi.fn(),
  createMaintenanceReminder: vi.fn(),
  createServiceRecord: vi.fn(),
  createVehicle: vi.fn(),
  deleteFuelEntry: vi.fn(),
  deleteMaintenanceReminder: vi.fn(),
  deleteServiceRecord: vi.fn(),
  deleteVehicle: vi.fn(),
  fetchCarDiaryState: vi.fn(),
  setMaintenanceReminderCompleted: vi.fn(),
  updateServiceRecord: vi.fn(),
  updateVehicle: vi.fn(),
  updateVehicleMileage: vi.fn(),
}))

vi.mock('../lib/car-diary-repository', () => repositoryMocks)

const carDiaryState: CarDiaryState = {
  version: 3,
  vehicles: [],
  activeVehicleId: null,
  serviceRecords: [],
  fuelEntries: [],
  maintenanceReminders: [],
}

const vehicleInput: VehicleInput = {
  make: 'Volvo',
  model: 'V60',
  year: 2021,
  registrationNumber: 'WX 1234A',
  vin: '',
  currentMileage: 86_200,
  distanceUnit: 'km',
}

const fuelEntryInput: FuelEntryInput = {
  date: '2026-08-16',
  mileage: 86_500,
  volumeInMilliliters: 42_750,
  totalCostInCents: 27_500,
  station: 'Orlen',
  fullTank: true,
}

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
}

describe('useCarDiary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    repositoryMocks.fetchCarDiaryState.mockResolvedValue(carDiaryState)
  })

  it('loads state and refreshes it after creating a vehicle', async () => {
    repositoryMocks.createVehicle.mockResolvedValue('vehicle-1')
    const { result } = renderHook(() => useCarDiary('user-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.stateQuery.isSuccess).toBe(true))

    await act(async () => {
      await result.current.createVehicleMutation.mutateAsync(vehicleInput)
    })

    expect(repositoryMocks.createVehicle).toHaveBeenCalledWith(vehicleInput)
    await waitFor(() =>
      expect(repositoryMocks.fetchCarDiaryState).toHaveBeenCalledTimes(2),
    )
  })

  it('updates mileage and refreshes the state', async () => {
    repositoryMocks.updateVehicleMileage.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCarDiary('user-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.stateQuery.isSuccess).toBe(true))

    await act(async () => {
      await result.current.updateVehicleMileageMutation.mutateAsync({
        vehicleId: 'vehicle-1',
        currentMileage: 90_000,
      })
    })

    expect(repositoryMocks.updateVehicleMileage).toHaveBeenCalledWith(
      'vehicle-1',
      90_000,
    )
    await waitFor(() =>
      expect(repositoryMocks.fetchCarDiaryState).toHaveBeenCalledTimes(2),
    )
  })

  it('creates a fuel entry and refreshes the state', async () => {
    repositoryMocks.createFuelEntry.mockResolvedValue(undefined)
    const { result } = renderHook(() => useCarDiary('user-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.stateQuery.isSuccess).toBe(true))

    await act(async () => {
      await result.current.createFuelEntryMutation.mutateAsync({
        vehicleId: 'vehicle-1',
        input: fuelEntryInput,
      })
    })

    expect(repositoryMocks.createFuelEntry).toHaveBeenCalledWith(
      'vehicle-1',
      fuelEntryInput,
    )
    await waitFor(() =>
      expect(repositoryMocks.fetchCarDiaryState).toHaveBeenCalledTimes(2),
    )
  })
})

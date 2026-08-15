import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CarDiaryState, VehicleInput } from '../types'
import { useCarDiary } from './useCarDiary'

const repositoryMocks = vi.hoisted(() => ({
  createMaintenanceReminder: vi.fn(),
  createServiceRecord: vi.fn(),
  createVehicle: vi.fn(),
  deleteMaintenanceReminder: vi.fn(),
  deleteServiceRecord: vi.fn(),
  deleteVehicle: vi.fn(),
  fetchCarDiaryState: vi.fn(),
  setMaintenanceReminderCompleted: vi.fn(),
  updateServiceRecord: vi.fn(),
  updateVehicle: vi.fn(),
}))

vi.mock('../lib/carDiaryRepository', () => repositoryMocks)

const carDiaryState: CarDiaryState = {
  version: 3,
  vehicles: [],
  activeVehicleId: null,
  serviceRecords: [],
  maintenanceReminders: [],
}

const vehicleInput: VehicleInput = {
  make: 'Volvo',
  model: 'V60',
  year: 2021,
  registrationNumber: 'WX 1234A',
  vin: '',
  currentMileage: 86_200,
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
})

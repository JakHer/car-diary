import type { CarDiaryState, ServiceRecord, Vehicle } from '../types'

const STORAGE_KEY = 'car-diary:data:v1'

export const createEmptyState = (): CarDiaryState => {
  return {
    version: 1,
    vehicles: [],
    activeVehicleId: null,
    serviceRecords: [],
  }
}

const isVehicle = (value: unknown): value is Vehicle => {
  if (!value || typeof value !== 'object') return false

  const vehicle = value as Partial<Vehicle>
  return (
    typeof vehicle.id === 'string' &&
    typeof vehicle.make === 'string' &&
    typeof vehicle.model === 'string' &&
    typeof vehicle.year === 'number' &&
    typeof vehicle.registrationNumber === 'string' &&
    typeof vehicle.vin === 'string' &&
    typeof vehicle.currentMileage === 'number' &&
    typeof vehicle.createdAt === 'string'
  )
}

const isServiceRecord = (value: unknown): value is ServiceRecord => {
  if (!value || typeof value !== 'object') return false

  const record = value as Partial<ServiceRecord>
  return (
    typeof record.id === 'string' &&
    typeof record.vehicleId === 'string' &&
    typeof record.title === 'string' &&
    typeof record.category === 'string' &&
    typeof record.date === 'string' &&
    typeof record.mileage === 'number' &&
    typeof record.workshop === 'string' &&
    typeof record.costInCents === 'number' &&
    typeof record.notes === 'string' &&
    typeof record.createdAt === 'string'
  )
}

const isCarDiaryState = (value: unknown): value is CarDiaryState => {
  if (!value || typeof value !== 'object') return false

  const state = value as Partial<CarDiaryState>
  return (
    state.version === 1 &&
    Array.isArray(state.vehicles) &&
    state.vehicles.every(isVehicle) &&
    (state.activeVehicleId === null ||
      typeof state.activeVehicleId === 'string') &&
    Array.isArray(state.serviceRecords) &&
    state.serviceRecords.every(isServiceRecord)
  )
}

export const loadCarDiaryState = (): CarDiaryState => {
  try {
    const storedState = window.localStorage.getItem(STORAGE_KEY)
    if (!storedState) return createEmptyState()

    const parsedState: unknown = JSON.parse(storedState)
    return isCarDiaryState(parsedState) ? parsedState : createEmptyState()
  } catch {
    return createEmptyState()
  }
}

export const saveCarDiaryState = (state: CarDiaryState): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

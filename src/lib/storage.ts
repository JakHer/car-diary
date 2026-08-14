import type { CarDiaryState, ServiceRecord, Vehicle } from '../types'

const STORAGE_KEY = 'car-diary:data:v2'
const LEGACY_STORAGE_KEY = 'car-diary:data:v1'

type LegacyVehicle = Omit<Vehicle, 'startingMileage'>

interface LegacyState {
  version: 1
  vehicles: LegacyVehicle[]
  activeVehicleId: string | null
  serviceRecords: ServiceRecord[]
}

export const createEmptyState = (): CarDiaryState => {
  return {
    version: 2,
    vehicles: [],
    activeVehicleId: null,
    serviceRecords: [],
  }
}

const isBaseVehicle = (value: unknown): value is LegacyVehicle => {
  if (!value || typeof value !== 'object') return false

  const vehicle = value as Partial<LegacyVehicle>
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

const isVehicle = (value: unknown): value is Vehicle => {
  return (
    isBaseVehicle(value) &&
    typeof (value as Partial<Vehicle>).startingMileage === 'number'
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

const hasValidCollections = (
  state: Partial<CarDiaryState | LegacyState>,
): boolean => {
  return (
    (state.activeVehicleId === null ||
      typeof state.activeVehicleId === 'string') &&
    Array.isArray(state.serviceRecords) &&
    state.serviceRecords.every(isServiceRecord)
  )
}

const isCarDiaryState = (value: unknown): value is CarDiaryState => {
  if (!value || typeof value !== 'object') return false

  const state = value as Partial<CarDiaryState>
  return (
    state.version === 2 &&
    Array.isArray(state.vehicles) &&
    state.vehicles.every(isVehicle) &&
    hasValidCollections(state)
  )
}

const isLegacyState = (value: unknown): value is LegacyState => {
  if (!value || typeof value !== 'object') return false

  const state = value as Partial<LegacyState>
  return (
    state.version === 1 &&
    Array.isArray(state.vehicles) &&
    state.vehicles.every(isBaseVehicle) &&
    hasValidCollections(state)
  )
}

const migrateLegacyState = (state: LegacyState): CarDiaryState => {
  return {
    ...state,
    version: 2,
    vehicles: state.vehicles.map((vehicle) => {
      const recordedMileages = state.serviceRecords
        .filter((record) => record.vehicleId === vehicle.id)
        .map((record) => record.mileage)

      return {
        ...vehicle,
        startingMileage: Math.min(
          vehicle.currentMileage,
          ...recordedMileages,
        ),
      }
    }),
  }
}

const parseStoredState = (storedState: string | null): unknown => {
  if (!storedState) return null

  try {
    return JSON.parse(storedState) as unknown
  } catch {
    return null
  }
}

export const loadCarDiaryState = (): CarDiaryState => {
  const currentState = parseStoredState(window.localStorage.getItem(STORAGE_KEY))
  if (isCarDiaryState(currentState)) return currentState

  const legacyState = parseStoredState(
    window.localStorage.getItem(LEGACY_STORAGE_KEY),
  )
  return isLegacyState(legacyState)
    ? migrateLegacyState(legacyState)
    : createEmptyState()
}

export const saveCarDiaryState = (state: CarDiaryState): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.localStorage.removeItem(LEGACY_STORAGE_KEY)
}

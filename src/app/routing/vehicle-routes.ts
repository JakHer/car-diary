import type { Vehicle } from '@/types'

type VehicleRouteEntry = Pick<Vehicle, 'id'>

export type VehicleSection =
  | 'overview'
  | 'service'
  | 'fuel'
  | 'reminders'

export const isVehicleSection = (
  value: string | undefined,
): value is VehicleSection =>
  value === 'overview' ||
  value === 'service' ||
  value === 'fuel' ||
  value === 'reminders'

export const getVehiclePath = (vehicleId: string): string =>
  `/vehicles/${encodeURIComponent(vehicleId)}`

export const getVehicleSectionPath = (
  vehicleId: string,
  section: VehicleSection,
): string =>
  section === 'overview'
    ? getVehiclePath(vehicleId)
    : `${getVehiclePath(vehicleId)}/${section}`

export const getVehicleRouteRedirect = (
  vehicles: VehicleRouteEntry[],
  vehicleId?: string,
): string | null => {
  if (vehicleId === undefined) return null
  if (vehicles.length === 0) return vehicleId ? '/' : null

  const hasRequestedVehicle = vehicles.some(
    (vehicle) => vehicle.id === vehicleId,
  )

  return hasRequestedVehicle ? null : getVehiclePath(vehicles[0].id)
}

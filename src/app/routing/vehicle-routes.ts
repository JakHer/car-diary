import type { Vehicle } from '@/types'

type VehicleRouteEntry = Pick<Vehicle, 'id'>

export const getVehiclePath = (vehicleId: string): string =>
  `/vehicles/${encodeURIComponent(vehicleId)}`

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

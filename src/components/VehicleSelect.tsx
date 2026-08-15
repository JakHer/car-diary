import type { Vehicle } from '../types'
import { SelectField } from './SelectField'

interface VehicleSelectProps {
  activeVehicleId: string
  vehicles: Vehicle[]
  onSelect: (vehicleId: string) => void
}

export const VehicleSelect = ({
  activeVehicleId,
  vehicles,
  onSelect,
}: VehicleSelectProps) => (
  <SelectField
    ariaLabel="Active vehicle"
    options={vehicles.map((vehicle) => ({
      label: `${vehicle.make} ${vehicle.model}`,
      value: vehicle.id,
    }))}
    value={activeVehicleId}
    variant="compact"
    onValueChange={onSelect}
  />
)

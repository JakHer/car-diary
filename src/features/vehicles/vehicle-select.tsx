import { useTranslation } from 'react-i18next'
import type { Vehicle } from '@/types'
import { SelectField } from '@/components/forms/select-field'

interface VehicleSelectProps {
  activeVehicleId: string
  vehicles: Vehicle[]
  onSelect: (vehicleId: string) => void
}

export const VehicleSelect = ({
  activeVehicleId,
  vehicles,
  onSelect,
}: VehicleSelectProps) => {
  const { t } = useTranslation()

  return (
    <SelectField
    ariaLabel={t('vehicle.select')}
    options={vehicles.map((vehicle) => ({
      label: `${vehicle.make} ${vehicle.model}`,
      value: vehicle.id,
    }))}
    value={activeVehicleId}
    variant="compact"
    onValueChange={onSelect}
    />
  )
}

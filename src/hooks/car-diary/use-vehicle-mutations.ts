import { useMutation } from '@tanstack/react-query'
import {
  createVehicle,
  deleteVehicle,
  updateVehicle,
  updateVehicleMileage,
} from '@/features/vehicles/vehicle-repository'
import type { VehicleInput } from '@/types'
import { carDiaryKeys } from './car-diary-keys'
import type { MutationSuccessHandler } from './types'

interface UpdateVehicleVariables {
  vehicleId: string
  input: VehicleInput
}

interface UpdateVehicleMileageVariables {
  vehicleId: string
  currentMileage: number
}

export const useVehicleMutations = (
  onSuccess: MutationSuccessHandler,
) => {
  const createVehicleMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'create-vehicle'],
    mutationFn: (input: VehicleInput) => createVehicle(input),
    onSuccess,
  })
  const updateVehicleMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'update-vehicle'],
    mutationFn: ({ vehicleId, input }: UpdateVehicleVariables) =>
      updateVehicle(vehicleId, input),
    onSuccess,
  })
  const updateVehicleMileageMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'update-vehicle-mileage'],
    mutationFn: ({
      vehicleId,
      currentMileage,
    }: UpdateVehicleMileageVariables) =>
      updateVehicleMileage(vehicleId, currentMileage),
    onSuccess,
  })
  const deleteVehicleMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-vehicle'],
    mutationFn: (vehicleId: string) => deleteVehicle(vehicleId),
    onSuccess,
  })

  return {
    createVehicleMutation,
    updateVehicleMutation,
    updateVehicleMileageMutation,
    deleteVehicleMutation,
  }
}

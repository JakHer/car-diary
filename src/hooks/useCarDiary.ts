import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createServiceRecord,
  createVehicle,
  deleteServiceRecord,
  deleteVehicle,
  fetchCarDiaryState,
  updateServiceRecord,
  updateVehicle,
} from '../lib/carDiaryRepository'
import type { ServiceRecordInput, VehicleInput } from '../types'

export const carDiaryKeys = {
  all: ['car-diary'] as const,
  state: (userId: string) => [...carDiaryKeys.all, 'state', userId] as const,
}

interface UpdateVehicleVariables {
  vehicleId: string
  input: VehicleInput
}

interface CreateServiceRecordVariables {
  vehicleId: string
  input: ServiceRecordInput
}

interface UpdateServiceRecordVariables {
  recordId: string
  input: ServiceRecordInput
}

export const useCarDiary = (userId: string) => {
  const queryClient = useQueryClient()
  const queryKey = carDiaryKeys.state(userId)
  const invalidateState = () => queryClient.invalidateQueries({ queryKey })

  const stateQuery = useQuery({
    queryKey,
    queryFn: () => fetchCarDiaryState(),
  })

  const createVehicleMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'create-vehicle'],
    mutationFn: (input: VehicleInput) => createVehicle(input),
    onSuccess: invalidateState,
  })

  const updateVehicleMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'update-vehicle'],
    mutationFn: ({ vehicleId, input }: UpdateVehicleVariables) =>
      updateVehicle(vehicleId, input),
    onSuccess: invalidateState,
  })

  const deleteVehicleMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-vehicle'],
    mutationFn: (vehicleId: string) => deleteVehicle(vehicleId),
    onSuccess: invalidateState,
  })

  const createServiceRecordMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'create-service-record'],
    mutationFn: ({ vehicleId, input }: CreateServiceRecordVariables) =>
      createServiceRecord(vehicleId, input),
    onSuccess: invalidateState,
  })

  const updateServiceRecordMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'update-service-record'],
    mutationFn: ({ recordId, input }: UpdateServiceRecordVariables) =>
      updateServiceRecord(recordId, input),
    onSuccess: invalidateState,
  })

  const deleteServiceRecordMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-service-record'],
    mutationFn: (recordId: string) => deleteServiceRecord(recordId),
    onSuccess: invalidateState,
  })

  const mutations = [
    createVehicleMutation,
    updateVehicleMutation,
    deleteVehicleMutation,
    createServiceRecordMutation,
    updateServiceRecordMutation,
    deleteServiceRecordMutation,
  ]

  const mutationError = mutations.find((mutation) => mutation.error)?.error
  const isMutating = mutations.some((mutation) => mutation.isPending)
  const resetMutationErrors = () => {
    mutations.forEach((mutation) => mutation.reset())
  }

  return {
    stateQuery,
    createVehicleMutation,
    updateVehicleMutation,
    deleteVehicleMutation,
    createServiceRecordMutation,
    updateServiceRecordMutation,
    deleteServiceRecordMutation,
    mutationError,
    isMutating,
    resetMutationErrors,
  }
}

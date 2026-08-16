import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFuelEntry,
  createMaintenanceReminder,
  createServiceRecord,
  createVehicle,
  deleteFuelEntry,
  deleteMaintenanceReminder,
  deleteServiceRecord,
  deleteVehicle,
  fetchCarDiaryState,
  setMaintenanceReminderCompleted,
  updateServiceRecord,
  updateVehicle,
  updateVehicleMileage,
} from '../lib/carDiaryRepository'
import type {
  FuelEntryInput,
  MaintenanceReminderInput,
  ServiceRecordInput,
  VehicleInput,
} from '../types'

export const carDiaryKeys = {
  all: ['car-diary'] as const,
  state: (userId: string) => [...carDiaryKeys.all, 'state', userId] as const,
}

interface UpdateVehicleVariables {
  vehicleId: string
  input: VehicleInput
}

interface UpdateVehicleMileageVariables {
  vehicleId: string
  currentMileage: number
}

interface CreateServiceRecordVariables {
  vehicleId: string
  input: ServiceRecordInput
}

interface CreateFuelEntryVariables {
  vehicleId: string
  input: FuelEntryInput
}

interface UpdateServiceRecordVariables {
  recordId: string
  input: ServiceRecordInput
}

interface CreateMaintenanceReminderVariables {
  vehicleId: string
  input: MaintenanceReminderInput
}

interface SetMaintenanceReminderCompletedVariables {
  reminderId: string
  completed: boolean
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

  const updateVehicleMileageMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'update-vehicle-mileage'],
    mutationFn: ({
      vehicleId,
      currentMileage,
    }: UpdateVehicleMileageVariables) =>
      updateVehicleMileage(vehicleId, currentMileage),
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

  const createFuelEntryMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'create-fuel-entry'],
    mutationFn: ({ vehicleId, input }: CreateFuelEntryVariables) =>
      createFuelEntry(vehicleId, input),
    onSuccess: invalidateState,
  })

  const deleteFuelEntryMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-fuel-entry'],
    mutationFn: (fuelEntryId: string) => deleteFuelEntry(fuelEntryId),
    onSuccess: invalidateState,
  })

  const createMaintenanceReminderMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'create-maintenance-reminder'],
    mutationFn: ({ vehicleId, input }: CreateMaintenanceReminderVariables) =>
      createMaintenanceReminder(vehicleId, input),
    onSuccess: invalidateState,
  })

  const setMaintenanceReminderCompletedMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'set-maintenance-reminder-completed'],
    mutationFn: ({
      reminderId,
      completed,
    }: SetMaintenanceReminderCompletedVariables) =>
      setMaintenanceReminderCompleted(reminderId, completed),
    onSuccess: invalidateState,
  })

  const deleteMaintenanceReminderMutation = useMutation({
    mutationKey: [...carDiaryKeys.all, 'delete-maintenance-reminder'],
    mutationFn: (reminderId: string) =>
      deleteMaintenanceReminder(reminderId),
    onSuccess: invalidateState,
  })

  const mutations = [
    createVehicleMutation,
    updateVehicleMutation,
    updateVehicleMileageMutation,
    deleteVehicleMutation,
    createServiceRecordMutation,
    updateServiceRecordMutation,
    deleteServiceRecordMutation,
    createFuelEntryMutation,
    deleteFuelEntryMutation,
    createMaintenanceReminderMutation,
    setMaintenanceReminderCompletedMutation,
    deleteMaintenanceReminderMutation,
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
    updateVehicleMileageMutation,
    deleteVehicleMutation,
    createServiceRecordMutation,
    updateServiceRecordMutation,
    deleteServiceRecordMutation,
    createFuelEntryMutation,
    deleteFuelEntryMutation,
    createMaintenanceReminderMutation,
    setMaintenanceReminderCompletedMutation,
    deleteMaintenanceReminderMutation,
    mutationError,
    isMutating,
    resetMutationErrors,
  }
}

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCarDiaryState } from '@/lib/car-diary-repository'
import { carDiaryKeys } from './car-diary/car-diary-keys'
import { useFuelMutations } from './car-diary/use-fuel-mutations'
import { useReminderMutations } from './car-diary/use-reminder-mutations'
import { useServiceMutations } from './car-diary/use-service-mutations'
import { useVehicleMutations } from './car-diary/use-vehicle-mutations'

export { carDiaryKeys } from './car-diary/car-diary-keys'

export const useCarDiary = (userId: string) => {
  const queryClient = useQueryClient()
  const queryKey = carDiaryKeys.state(userId)
  const invalidateState = () => queryClient.invalidateQueries({ queryKey })
  const stateQuery = useQuery({
    queryKey,
    queryFn: () => fetchCarDiaryState(),
  })
  const vehicleMutations = useVehicleMutations(invalidateState)
  const serviceMutations = useServiceMutations(userId, invalidateState)
  const fuelMutations = useFuelMutations(userId, invalidateState)
  const reminderMutations = useReminderMutations(invalidateState)
  const mutations = [
    ...Object.values(vehicleMutations),
    ...Object.values(serviceMutations),
    ...Object.values(fuelMutations),
    ...Object.values(reminderMutations),
  ]
  const mutationError = mutations.find((mutation) => mutation.error)?.error
  const isMutating = mutations.some((mutation) => mutation.isPending)
  const resetMutationErrors = () => {
    mutations.forEach((mutation) => mutation.reset())
  }

  return {
    stateQuery,
    ...vehicleMutations,
    ...serviceMutations,
    ...fuelMutations,
    ...reminderMutations,
    mutationError,
    isMutating,
    resetMutationErrors,
  }
}

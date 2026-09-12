import { useMemo } from 'react'
import type { CarDiaryState } from '@/types'

interface UseActiveVehicleDataOptions {
  routeVehicleId?: string
  selectedVehicleId?: string | null
  state: CarDiaryState
}

export const useActiveVehicleData = ({
  routeVehicleId,
  selectedVehicleId,
  state,
}: UseActiveVehicleDataOptions) => {
  const activeVehicle =
    state.vehicles.find((vehicle) => vehicle.id === routeVehicleId) ??
    (routeVehicleId === undefined
      ? state.vehicles.find(
          (vehicle) => vehicle.id === selectedVehicleId,
        ) ?? state.vehicles[0]
      : undefined)
  const activeVehicleId = activeVehicle?.id ?? null

  const records = useMemo(
    () =>
      state.serviceRecords
        .filter((record) => record.vehicleId === activeVehicleId)
        .toSorted(
          (first, second) =>
            second.date.localeCompare(first.date) ||
            second.mileage - first.mileage,
        ),
    [activeVehicleId, state.serviceRecords],
  )

  const reminders = useMemo(
    () =>
      state.maintenanceReminders.filter(
        (reminder) => reminder.vehicleId === activeVehicleId,
      ),
    [activeVehicleId, state.maintenanceReminders],
  )

  const fuelEntries = useMemo(
    () =>
      state.fuelEntries.filter(
        (entry) => entry.vehicleId === activeVehicleId,
      ),
    [activeVehicleId, state.fuelEntries],
  )

  const attachments = useMemo(() => {
    const recordIds = new Set(records.map((record) => record.id))
    return state.serviceAttachments.filter((attachment) =>
      recordIds.has(attachment.serviceRecordId),
    )
  }, [records, state.serviceAttachments])

  const fuelAttachments = useMemo(() => {
    const fuelEntryIds = new Set(fuelEntries.map((entry) => entry.id))
    return state.fuelAttachments.filter((attachment) =>
      fuelEntryIds.has(attachment.fuelEntryId),
    )
  }, [fuelEntries, state.fuelAttachments])

  return {
    activeVehicle,
    attachments,
    fuelAttachments,
    fuelEntries,
    records,
    reminders,
  }
}

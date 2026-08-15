import { useEffect, useMemo, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { AuthScreen } from './components/AuthScreen'
import {
  ConfigurationScreen,
  ErrorScreen,
  LoadingScreen,
} from './components/StatusScreen'
import {
  VehicleDialog,
  type VehicleFormMode,
} from './components/VehicleDialog'
import { VehicleDashboard } from './components/VehicleDashboard'
import { VehicleForm } from './components/VehicleForm'
import { useAuth } from './hooks/useAuth'
import { useCarDiary } from './hooks/useCarDiary'
import { queryClient } from './lib/queryClient'
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from './lib/supabase'
import type {
  CarDiaryState,
  ServiceRecordInput,
  VehicleInput,
} from './types'
import './App.css'

const emptyState: CarDiaryState = {
  version: 2,
  vehicles: [],
  activeVehicleId: null,
  serviceRecords: [],
}

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

interface CarDiaryAppProps {
  userId: string
  userEmail: string
  onSignOut: () => Promise<void>
}

const CarDiaryApp = ({ userId, userEmail, onSignOut }: CarDiaryAppProps) => {
  const {
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
  } = useCarDiary(userId)
  const state = stateQuery.data ?? emptyState
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [vehicleFormMode, setVehicleFormMode] =
    useState<VehicleFormMode | null>(null)
  useEffect(() => {
    setActiveVehicleId((currentVehicleId) =>
      state.vehicles.some((vehicle) => vehicle.id === currentVehicleId)
        ? currentVehicleId
        : (state.vehicles[0]?.id ?? null),
    )
  }, [state.vehicles])

  const activeVehicle = state.vehicles.find(
    (vehicle) => vehicle.id === activeVehicleId,
  )

  const activeRecords = useMemo(
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

  const addVehicle = (input: VehicleInput) => {
    resetMutationErrors()
    void createVehicleMutation
      .mutateAsync(input)
      .then((vehicleId) => {
        setActiveVehicleId(vehicleId)
        setEditingRecordId(null)
        setVehicleFormMode(null)
      })
      .catch(() => undefined)
  }

  const updateVehicle = (input: VehicleInput) => {
    if (!activeVehicle) return

    resetMutationErrors()
    void updateVehicleMutation
      .mutateAsync({ vehicleId: activeVehicle.id, input })
      .then(() => setVehicleFormMode(null))
      .catch(() => undefined)
  }

  const selectVehicle = (vehicleId: string) => {
    setActiveVehicleId(vehicleId)
    setEditingRecordId(null)
  }

  const deleteVehicle = () => {
    if (!activeVehicle) return

    const serviceCount = activeRecords.length
    const shouldDelete = window.confirm(
      `Delete ${activeVehicle.make} ${activeVehicle.model} and ${serviceCount} ${serviceCount === 1 ? 'service record' : 'service records'}? This action cannot be undone.`,
    )
    if (!shouldDelete) return

    resetMutationErrors()
    void deleteVehicleMutation
      .mutateAsync(activeVehicle.id)
      .then(() => {
        setActiveVehicleId(null)
        setEditingRecordId(null)
        setVehicleFormMode(null)
      })
      .catch(() => undefined)
  }

  const saveServiceRecord = (input: ServiceRecordInput) => {
    if (!activeVehicle) return

    resetMutationErrors()
    const mutation = editingRecordId
      ? updateServiceRecordMutation.mutateAsync({
          recordId: editingRecordId,
          input,
        })
      : createServiceRecordMutation.mutateAsync({
          vehicleId: activeVehicle.id,
          input,
        })

    void mutation
      .then(() => setEditingRecordId(null))
      .catch(() => undefined)
  }

  const deleteServiceRecord = (recordId: string) => {
    const record = activeRecords.find((entry) => entry.id === recordId)
    if (!activeVehicle || !record) return

    const shouldDelete = window.confirm(
      `Delete "${record.title}"? This action cannot be undone.`,
    )
    if (!shouldDelete) return

    resetMutationErrors()
    void deleteServiceRecordMutation
      .mutateAsync(recordId)
      .then(() => {
        if (editingRecordId === recordId) setEditingRecordId(null)
      })
      .catch(() => undefined)
  }

  const dataError = stateQuery.error ?? mutationError
  const handleDataError = () => {
    resetMutationErrors()
    if (stateQuery.error) void stateQuery.refetch()
  }

  if (stateQuery.isPending) {
    return <LoadingScreen message="Loading your garage..." />
  }

  if (stateQuery.isError && !stateQuery.data) {
    return (
      <ErrorScreen
        message={getErrorMessage(dataError)}
        onRetry={() => void stateQuery.refetch()}
      />
    )
  }

  return (
    <div className="app-shell" aria-busy={isMutating}>
      <AppHeader
        activeVehicle={activeVehicle}
        userEmail={userEmail}
        vehicles={state.vehicles}
        onAddVehicle={() => setVehicleFormMode('add')}
        onSelectVehicle={selectVehicle}
        onSignOut={onSignOut}
      />

      {dataError && (
        <div className="error-banner" role="alert">
          <span>{getErrorMessage(dataError)}</span>
          <button type="button" onClick={handleDataError}>
            {stateQuery.error ? 'Retry' : 'Dismiss'}
          </button>
        </div>
      )}

      {isMutating && (
        <div className="sync-indicator" role="status">
          Syncing changes...
        </div>
      )}

      {!activeVehicle ? (
        <main className="onboarding">
          <div className="onboarding-copy">
            <p className="eyebrow">Your car's story starts here</p>
            <h1>Keep every mile and service on record.</h1>
            <p>
              Create a vehicle profile, then log maintenance, repairs, and
              expenses as they happen.
            </p>
          </div>
          <VehicleForm onSave={addVehicle} />
        </main>
      ) : (
        <VehicleDashboard
          editingRecordId={editingRecordId}
          records={activeRecords}
          vehicle={activeVehicle}
          onCancelRecordEdit={() => setEditingRecordId(null)}
          onDeleteRecord={deleteServiceRecord}
          onDeleteVehicle={deleteVehicle}
          onEditRecord={setEditingRecordId}
          onEditVehicle={() => setVehicleFormMode('edit')}
          onSaveRecord={saveServiceRecord}
        />
      )}

      {vehicleFormMode && activeVehicle && (
        <VehicleDialog
          mode={vehicleFormMode}
          vehicle={activeVehicle}
          onClose={() => setVehicleFormMode(null)}
          onSave={vehicleFormMode === 'edit' ? updateVehicle : addVehicle}
        />
      )}
    </div>
  )
}

const App = () => {
  const { session, isLoading } = useAuth()

  if (!isSupabaseConfigured) return <ConfigurationScreen />
  if (isLoading) return <LoadingScreen message="Checking your session..." />
  if (!session) return <AuthScreen />

  const signOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut()
    if (error) {
      window.alert(error.message)
      return
    }

    queryClient.clear()
  }

  return (
    <CarDiaryApp
      userId={session.user.id}
      userEmail={session.user.email ?? 'Signed-in account'}
      onSignOut={signOut}
    />
  )
}

export default App

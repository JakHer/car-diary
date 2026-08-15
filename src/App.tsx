import { useEffect, useMemo, useState } from 'react'
import { AuthScreen } from './components/AuthScreen'
import { ServiceForm } from './components/ServiceForm'
import { ServiceHistory } from './components/ServiceHistory'
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

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
})

const lastServiceFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
})

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
  const [vehicleFormMode, setVehicleFormMode] = useState<
    'add' | 'edit' | null
  >(null)
  useEffect(() => {
    setActiveVehicleId((currentVehicleId) =>
      state.vehicles.some((vehicle) => vehicle.id === currentVehicleId)
        ? currentVehicleId
        : (state.vehicles[0]?.id ?? null),
    )
  }, [state.vehicles])

  useEffect(() => {
    if (!vehicleFormMode) return undefined

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVehicleFormMode(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [vehicleFormMode])

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

  const editingRecord = activeRecords.find(
    (record) => record.id === editingRecordId,
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

  const totalCost = activeRecords.reduce(
    (sum, record) => sum + record.costInCents,
    0,
  )

  if (stateQuery.isPending) {
    return <LoadingScreen message="Loading your garage..." />
  }

  if (stateQuery.isError && !stateQuery.data) {
    return (
      <main className="status-screen">
        <span className="brand-mark" aria-hidden="true">
          CD
        </span>
        <h1>We could not load your garage.</h1>
        <p>{getErrorMessage(dataError)}</p>
        <button
          className="button button-primary"
          type="button"
          onClick={() => void stateQuery.refetch()}
        >
          Try again
        </button>
      </main>
    )
  }

  return (
    <div className="app-shell" aria-busy={isMutating}>
      <header className="app-header">
        <a className="brand" href="/" aria-label="Car Diary home page">
          <span className="brand-mark" aria-hidden="true">
            CD
          </span>
          <span>Car Diary</span>
        </a>
        <div className="app-header-actions">
          {activeVehicle && (
            <div className="vehicle-switcher">
              <select
                aria-label="Active vehicle"
                value={activeVehicle.id}
                onChange={(event) => selectVehicle(event.target.value)}
              >
                {state.vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
              <button
                className="button button-secondary button-small"
                type="button"
                onClick={() => setVehicleFormMode('add')}
              >
                + Add
              </button>
            </div>
          )}
          <span className="storage-status">
            <span aria-hidden="true" /> Supabase
          </span>
          <div className="account-menu">
            <span title={userEmail}>{userEmail}</span>
            <button type="button" onClick={() => void onSignOut()}>
              Sign out
            </button>
          </div>
        </div>
      </header>

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
        <main className="dashboard">
          <section className="vehicle-hero">
            <div>
              <p className="eyebrow">Active vehicle</p>
              <h1>
                {activeVehicle.make} {activeVehicle.model}
              </h1>
              <div className="vehicle-meta">
                <span>{activeVehicle.year}</span>
                {activeVehicle.registrationNumber && (
                  <span>{activeVehicle.registrationNumber}</span>
                )}
                {activeVehicle.vin && <span>VIN {activeVehicle.vin}</span>}
              </div>
              <div className="vehicle-actions">
                <button type="button" onClick={() => setVehicleFormMode('edit')}>
                  Edit vehicle
                </button>
                <button
                  className="button-danger"
                  type="button"
                  onClick={() => void deleteVehicle()}
                >
                  Delete vehicle
                </button>
              </div>
            </div>
            <div className="mileage-display">
              <span>Current mileage</span>
              <strong>
                {activeVehicle.currentMileage.toLocaleString('en-GB')}
                <small> km</small>
              </strong>
            </div>
          </section>

          <section className="summary-grid" aria-label="Vehicle summary">
            <article className="summary-card">
              <span>Service entries</span>
              <strong>{activeRecords.length}</strong>
              <p>Recorded for this vehicle</p>
            </article>
            <article className="summary-card">
              <span>Total service cost</span>
              <strong>{currencyFormatter.format(totalCost / 100)}</strong>
              <p>Across all entries</p>
            </article>
            <article className="summary-card">
              <span>Last service</span>
              <strong>
                {activeRecords[0]
                  ? lastServiceFormatter.format(
                      new Date(`${activeRecords[0].date}T12:00:00`),
                    )
                  : 'Not yet'}
              </strong>
              <p>{activeRecords[0]?.title ?? 'Add your first record'}</p>
            </article>
          </section>

          <div className="workspace-grid">
            <ServiceHistory
              records={activeRecords}
              editingRecordId={editingRecordId}
              onDelete={(recordId) => void deleteServiceRecord(recordId)}
              onEdit={setEditingRecordId}
            />
            <ServiceForm
              key={editingRecord?.id ?? `new-${activeRecords.length}`}
              currentMileage={activeVehicle.currentMileage}
              record={editingRecord}
              onCancel={() => setEditingRecordId(null)}
              onSave={saveServiceRecord}
            />
          </div>
        </main>
      )}

      {vehicleFormMode && activeVehicle && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setVehicleFormMode(null)
          }}
        >
          <div
            className="vehicle-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={
              vehicleFormMode === 'edit' ? 'Edit vehicle' : 'Add vehicle'
            }
          >
            <button
              className="dialog-close"
              type="button"
              aria-label="Close vehicle form"
              onClick={() => setVehicleFormMode(null)}
            >
              X
            </button>
            <VehicleForm
              key={vehicleFormMode === 'edit' ? activeVehicle.id : 'new'}
              vehicle={vehicleFormMode === 'edit' ? activeVehicle : undefined}
              onCancel={() => setVehicleFormMode(null)}
              onSave={vehicleFormMode === 'edit' ? updateVehicle : addVehicle}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface LoadingScreenProps {
  message: string
}

const LoadingScreen = ({ message }: LoadingScreenProps) => (
  <main className="status-screen">
    <span className="brand-mark" aria-hidden="true">
      CD
    </span>
    <div className="loading-dot" aria-hidden="true" />
    <p>{message}</p>
  </main>
)

const ConfigurationScreen = () => (
  <main className="status-screen">
    <span className="brand-mark" aria-hidden="true">
      CD
    </span>
    <h1>Supabase is not configured.</h1>
    <p>Add the required values to your `.env.local` file and restart Vite.</p>
  </main>
)

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

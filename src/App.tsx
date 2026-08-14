import { useEffect, useMemo, useState } from 'react'
import { ServiceForm } from './components/ServiceForm'
import { ServiceHistory } from './components/ServiceHistory'
import { VehicleForm } from './components/VehicleForm'
import { loadCarDiaryState, saveCarDiaryState } from './lib/storage'
import type {
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
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

const getVehicleMileage = (
  vehicle: Vehicle,
  records: ServiceRecord[],
): number => {
  const recordedMileages = records
    .filter((record) => record.vehicleId === vehicle.id)
    .map((record) => record.mileage)

  return Math.max(vehicle.startingMileage, ...recordedMileages)
}

const App = () => {
  const [state, setState] = useState(loadCarDiaryState)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [vehicleFormMode, setVehicleFormMode] = useState<
    'add' | 'edit' | null
  >(null)

  useEffect(() => {
    saveCarDiaryState(state)
  }, [state])

  useEffect(() => {
    if (!vehicleFormMode) return undefined

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVehicleFormMode(null)
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [vehicleFormMode])

  const activeVehicle = state.vehicles.find(
    (vehicle) => vehicle.id === state.activeVehicleId,
  )

  const activeRecords = useMemo(
    () =>
      state.serviceRecords
        .filter((record) => record.vehicleId === state.activeVehicleId)
        .toSorted(
          (first, second) =>
            second.date.localeCompare(first.date) ||
            second.mileage - first.mileage,
        ),
    [state.activeVehicleId, state.serviceRecords],
  )

  const editingRecord = activeRecords.find(
    (record) => record.id === editingRecordId,
  )

  const addVehicle = (input: VehicleInput) => {
    const vehicle: Vehicle = {
      ...input,
      id: crypto.randomUUID(),
      startingMileage: input.currentMileage,
      createdAt: new Date().toISOString(),
    }

    setState((currentState) => ({
      ...currentState,
      vehicles: [...currentState.vehicles, vehicle],
      activeVehicleId: vehicle.id,
    }))
    setEditingRecordId(null)
    setVehicleFormMode(null)
  }

  const updateVehicle = (input: VehicleInput) => {
    if (!activeVehicle) return

    setState((currentState) => ({
      ...currentState,
      vehicles: currentState.vehicles.map((vehicle) => {
        if (vehicle.id !== activeVehicle.id) return vehicle

        const updatedVehicle: Vehicle = {
          ...vehicle,
          ...input,
          startingMileage: input.currentMileage,
        }

        return {
          ...updatedVehicle,
          currentMileage: getVehicleMileage(
            updatedVehicle,
            currentState.serviceRecords,
          ),
        }
      }),
    }))
    setVehicleFormMode(null)
  }

  const selectVehicle = (vehicleId: string) => {
    setState((currentState) => ({
      ...currentState,
      activeVehicleId: vehicleId,
    }))
    setEditingRecordId(null)
  }

  const deleteVehicle = () => {
    if (!activeVehicle) return

    const serviceCount = activeRecords.length
    const shouldDelete = window.confirm(
      `Delete ${activeVehicle.make} ${activeVehicle.model} and ${serviceCount} ${serviceCount === 1 ? 'service record' : 'service records'}? This action cannot be undone.`,
    )
    if (!shouldDelete) return

    setState((currentState) => {
      const nextVehicles = currentState.vehicles.filter(
        (vehicle) => vehicle.id !== activeVehicle.id,
      )

      return {
        ...currentState,
        vehicles: nextVehicles,
        activeVehicleId: nextVehicles[0]?.id ?? null,
        serviceRecords: currentState.serviceRecords.filter(
          (record) => record.vehicleId !== activeVehicle.id,
        ),
      }
    })
    setEditingRecordId(null)
    setVehicleFormMode(null)
  }

  const saveServiceRecord = (input: ServiceRecordInput) => {
    if (!activeVehicle) return

    setState((currentState) => {
      const nextRecords = editingRecordId
        ? currentState.serviceRecords.map((record) =>
            record.id === editingRecordId ? { ...record, ...input } : record,
          )
        : [
            ...currentState.serviceRecords,
            {
              ...input,
              id: crypto.randomUUID(),
              vehicleId: activeVehicle.id,
              createdAt: new Date().toISOString(),
            },
          ]

      return {
        ...currentState,
        vehicles: currentState.vehicles.map((vehicle) =>
          vehicle.id === activeVehicle.id
            ? {
                ...vehicle,
                currentMileage: getVehicleMileage(vehicle, nextRecords),
              }
            : vehicle,
        ),
        serviceRecords: nextRecords,
      }
    })

    setEditingRecordId(null)
  }

  const deleteServiceRecord = (recordId: string) => {
    const record = activeRecords.find((entry) => entry.id === recordId)
    if (!activeVehicle || !record) return

    const shouldDelete = window.confirm(
      `Delete "${record.title}"? This action cannot be undone.`,
    )
    if (!shouldDelete) return

    setState((currentState) => {
      const nextRecords = currentState.serviceRecords.filter(
        (entry) => entry.id !== recordId,
      )

      return {
        ...currentState,
        vehicles: currentState.vehicles.map((vehicle) =>
          vehicle.id === activeVehicle.id
            ? {
                ...vehicle,
                currentMileage: getVehicleMileage(vehicle, nextRecords),
              }
            : vehicle,
        ),
        serviceRecords: nextRecords,
      }
    })

    if (editingRecordId === recordId) setEditingRecordId(null)
  }

  const totalCost = activeRecords.reduce(
    (sum, record) => sum + record.costInCents,
    0,
  )

  return (
    <div className="app-shell">
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
            <span aria-hidden="true" /> Local storage
          </span>
        </div>
      </header>

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
                  onClick={deleteVehicle}
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
              onDelete={deleteServiceRecord}
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

export default App

import { useEffect, useMemo, useState } from 'react'
import { ServiceForm } from './components/ServiceForm'
import { ServiceHistory } from './components/ServiceHistory'
import { VehicleSetup } from './components/VehicleSetup'
import { loadCarDiaryState, saveCarDiaryState } from './lib/storage'
import type {
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

const App = () => {
  const [state, setState] = useState(loadCarDiaryState)

  useEffect(() => {
    saveCarDiaryState(state)
  }, [state])

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

  const addVehicle = (input: VehicleInput) => {
    const vehicle: Vehicle = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    setState((currentState) => ({
      ...currentState,
      vehicles: [...currentState.vehicles, vehicle],
      activeVehicleId: vehicle.id,
    }))
  }

  const addServiceRecord = (input: ServiceRecordInput) => {
    if (!activeVehicle) return

    const record = {
      ...input,
      id: crypto.randomUUID(),
      vehicleId: activeVehicle.id,
      createdAt: new Date().toISOString(),
    }

    setState((currentState) => ({
      ...currentState,
      vehicles: currentState.vehicles.map((vehicle) =>
        vehicle.id === activeVehicle.id
          ? {
              ...vehicle,
              currentMileage: Math.max(vehicle.currentMileage, input.mileage),
            }
          : vehicle,
      ),
      serviceRecords: [...currentState.serviceRecords, record],
    }))
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
        <span className="storage-status">
          <span aria-hidden="true" /> Local storage
        </span>
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
          <VehicleSetup onSave={addVehicle} />
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
                  ? new Intl.DateTimeFormat('en-GB', {
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(`${activeRecords[0].date}T12:00:00`))
                  : 'Not yet'}
              </strong>
              <p>{activeRecords[0]?.title ?? 'Add your first record'}</p>
            </article>
          </section>

          <div className="workspace-grid">
            <ServiceHistory records={activeRecords} />
            <ServiceForm
              currentMileage={activeVehicle.currentMileage}
              onAdd={addServiceRecord}
            />
          </div>
        </main>
      )}
    </div>
  )
}

export default App

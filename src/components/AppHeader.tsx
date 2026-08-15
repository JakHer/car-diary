import type { Vehicle } from '../types'

interface AppHeaderProps {
  activeVehicle: Vehicle | undefined
  userEmail: string
  vehicles: Vehicle[]
  onAddVehicle: () => void
  onSelectVehicle: (vehicleId: string) => void
  onSignOut: () => Promise<void>
}

export const AppHeader = ({
  activeVehicle,
  userEmail,
  vehicles,
  onAddVehicle,
  onSelectVehicle,
  onSignOut,
}: AppHeaderProps) => (
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
            onChange={(event) => onSelectVehicle(event.target.value)}
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
          <button
            className="button button-secondary button-small"
            type="button"
            onClick={onAddVehicle}
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
)

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CarDiaryState, Vehicle } from './types'
import CarDiaryApp from './CarDiaryApp'

const hookMocks = vi.hoisted(() => ({
  useCarDiary: vi.fn(),
}))

vi.mock('./hooks/useCarDiary', () => hookMocks)

vi.mock('./components/AppHeader', () => ({
  AppHeader: ({
    activeVehicle,
    onSelectVehicle,
  }: {
    activeVehicle?: Vehicle
    onSelectVehicle?: (vehicleId: string) => void
  }) => (
    <header>
      <output data-testid="header-vehicle">{activeVehicle?.id}</output>
      <button
        type="button"
        onClick={() => onSelectVehicle?.('vehicle-2')}
      >
        Select Volvo
      </button>
    </header>
  ),
}))

vi.mock('./components/VehicleDashboard', () => ({
  VehicleDashboard: ({ vehicle }: { vehicle: Vehicle }) => (
    <h1>
      {vehicle.make} {vehicle.model}
    </h1>
  ),
}))

vi.mock('./components/VehicleDialog', () => ({
  VehicleDialog: () => null,
}))

vi.mock('./components/VehicleForm', () => ({
  VehicleForm: () => <div>Empty garage</div>,
}))

vi.mock('./components/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}))

const vehicles: Vehicle[] = [
  {
    id: 'vehicle-1',
    make: 'Audi',
    model: 'RS3',
    year: 2022,
    registrationNumber: '',
    vin: '',
    distanceUnit: 'km',
    startingMileage: 46_000,
    currentMileage: 46_000,
    createdAt: '2026-08-16T00:00:00Z',
  },
  {
    id: 'vehicle-2',
    make: 'Volvo',
    model: 'V60',
    year: 2021,
    registrationNumber: '',
    vin: '',
    distanceUnit: 'km',
    startingMileage: 80_000,
    currentMileage: 80_000,
    createdAt: '2026-08-16T00:00:00Z',
  },
]

const state: CarDiaryState = {
  version: 3,
  vehicles,
  activeVehicleId: null,
  serviceRecords: [],
  fuelEntries: [],
  maintenanceReminders: [],
}

const createMutation = () => ({
  isPending: false,
  mutateAsync: vi.fn(),
})

const createHookResult = () => ({
  stateQuery: {
    data: state,
    error: null,
    isError: false,
    isPending: false,
    refetch: vi.fn(),
  },
  createVehicleMutation: createMutation(),
  updateVehicleMutation: createMutation(),
  updateVehicleMileageMutation: createMutation(),
  deleteVehicleMutation: createMutation(),
  createServiceRecordMutation: createMutation(),
  updateServiceRecordMutation: createMutation(),
  deleteServiceRecordMutation: createMutation(),
  createFuelEntryMutation: createMutation(),
  deleteFuelEntryMutation: createMutation(),
  createMaintenanceReminderMutation: createMutation(),
  setMaintenanceReminderCompletedMutation: createMutation(),
  deleteMaintenanceReminderMutation: createMutation(),
  mutationError: null,
  isMutating: false,
  resetMutationErrors: vi.fn(),
})

const RouteState = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div>
      <output data-testid="current-route">{location.pathname}</output>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  )
}

const GarageRoute = () => (
  <>
    <CarDiaryApp
      defaultDistanceUnit="km"
      userId="user-1"
      userEmail="driver@example.com"
      onSignOut={vi.fn()}
    />
    <RouteState />
  </>
)

const renderGarage = (initialPath: string) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<GarageRoute />} />
        <Route path="/vehicles/:vehicleId" element={<GarageRoute />} />
      </Routes>
    </MemoryRouter>,
  )

describe('CarDiaryApp vehicle routing', () => {
  beforeEach(() => {
    hookMocks.useCarDiary.mockReturnValue(createHookResult())
  })

  it('renders the vehicle requested by a direct URL', () => {
    renderGarage('/vehicles/vehicle-2')

    expect(screen.getByRole('heading', { name: 'Volvo V60' })).toBeVisible()
    expect(screen.getByTestId('header-vehicle')).toHaveTextContent('vehicle-2')
  })

  it.each(['/', '/vehicles/missing'])(
    'redirects %s to the first available vehicle',
    async (initialPath) => {
      renderGarage(initialPath)

      await waitFor(() =>
        expect(screen.getByTestId('current-route')).toHaveTextContent(
          '/vehicles/vehicle-1',
        ),
      )
      expect(screen.getByRole('heading', { name: 'Audi RS3' })).toBeVisible()
    },
  )

  it('updates the URL on selection and supports browser back', async () => {
    const user = userEvent.setup()
    renderGarage('/vehicles/vehicle-1')

    await user.click(screen.getByRole('button', { name: 'Select Volvo' }))
    expect(screen.getByTestId('current-route')).toHaveTextContent(
      '/vehicles/vehicle-2',
    )
    expect(screen.getByRole('heading', { name: 'Volvo V60' })).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() =>
      expect(screen.getByTestId('current-route')).toHaveTextContent(
        '/vehicles/vehicle-1',
      ),
    )
    expect(screen.getByRole('heading', { name: 'Audi RS3' })).toBeVisible()
  })
})

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
import type { CarDiaryState, Vehicle } from '@/types'
import CarDiaryApp from './car-diary-app'

const hookMocks = vi.hoisted(() => ({
  useCarDiary: vi.fn(),
}))

vi.mock('@/hooks/use-car-diary', () => hookMocks)
vi.mock('@/lib/account-preferences', () => ({
  saveActiveVehicleId: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/components/layout/app-header', () => ({
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

vi.mock('@/features/vehicles/vehicle-dashboard', () => ({
  VehicleDashboard: ({
    section,
    vehicle,
  }: {
    section: string
    vehicle: Vehicle
  }) => (
    <div>
      <h1>
        {vehicle.make} {vehicle.model}
      </h1>
      <output data-testid="vehicle-section">{section}</output>
    </div>
  ),
}))

vi.mock('@/pages/home/home-dashboard', () => ({
  HomeDashboard: ({ vehicle }: { vehicle: Vehicle }) => (
    <h1>Home for {vehicle.make} {vehicle.model}</h1>
  ),
}))

vi.mock('@/features/vehicles/vehicle-dialog', () => ({
  VehicleDialog: () => null,
}))

vi.mock('@/features/vehicles/vehicle-form', () => ({
  VehicleForm: () => <div>Empty garage</div>,
}))

vi.mock('@/components/overlays/confirm-dialog', () => ({
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
  version: 5,
  vehicles,
  activeVehicleId: null,
  serviceRecords: [],
  serviceAttachments: [],
  fuelEntries: [],
  fuelAttachments: [],
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
  uploadServiceAttachmentMutation: createMutation(),
  deleteServiceAttachmentMutation: createMutation(),
  createFuelEntryMutation: createMutation(),
  updateFuelEntryMutation: createMutation(),
  deleteFuelEntryMutation: createMutation(),
  uploadFuelAttachmentMutation: createMutation(),
  deleteFuelAttachmentMutation: createMutation(),
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
        <Route
          path="/vehicles/:vehicleId/:section"
          element={<GarageRoute />}
        />
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
    expect(screen.getByTestId('vehicle-section')).toHaveTextContent('overview')
  })

  it('renders a vehicle section requested by a direct URL', () => {
    renderGarage('/vehicles/vehicle-2/fuel')

    expect(screen.getByRole('heading', { name: 'Volvo V60' })).toBeVisible()
    expect(screen.getByTestId('vehicle-section')).toHaveTextContent('fuel')
  })

  it('redirects an unknown vehicle section to its overview', async () => {
    renderGarage('/vehicles/vehicle-2/unknown')

    await waitFor(() =>
      expect(screen.getByTestId('current-route')).toHaveTextContent(
        '/vehicles/vehicle-2',
      ),
    )
    expect(screen.getByTestId('vehicle-section')).toHaveTextContent('overview')
  })

  it('renders the home dashboard at the garage root', () => {
    renderGarage('/')

    expect(screen.getByTestId('current-route')).toHaveTextContent('/')
    expect(
      screen.getByRole('heading', { name: 'Home for Audi RS3' }),
    ).toBeVisible()
  })

  it('switches the active vehicle on the home dashboard without leaving it', async () => {
    const user = userEvent.setup()
    renderGarage('/')

    await user.click(screen.getByRole('button', { name: 'Select Volvo' }))

    expect(screen.getByTestId('current-route')).toHaveTextContent('/')
    expect(
      screen.getByRole('heading', { name: 'Home for Volvo V60' }),
    ).toBeVisible()
    expect(screen.getByTestId('header-vehicle')).toHaveTextContent('vehicle-2')
  })

  it('redirects an invalid vehicle route to the first vehicle', async () => {
    renderGarage('/vehicles/missing')

    await waitFor(() =>
      expect(screen.getByTestId('current-route')).toHaveTextContent(
        '/vehicles/vehicle-1',
      ),
    )
    expect(screen.getByRole('heading', { name: 'Audi RS3' })).toBeVisible()
  })

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

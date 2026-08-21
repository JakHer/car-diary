import { describe, expect, it } from 'vitest'
import {
  getVehiclePath,
  getVehicleRouteRedirect,
} from './vehicle-routes'

const vehicles = [{ id: 'vehicle-1' }, { id: 'vehicle-2' }]

describe('vehicle routes', () => {
  it('creates an encoded vehicle path', () => {
    expect(getVehiclePath('vehicle/with spaces')).toBe(
      '/vehicles/vehicle%2Fwith%20spaces',
    )
  })

  it('keeps the garage root as the home dashboard', () => {
    expect(getVehicleRouteRedirect(vehicles)).toBeNull()
  })

  it('keeps a valid vehicle route', () => {
    expect(getVehicleRouteRedirect(vehicles, 'vehicle-2')).toBeNull()
  })

  it('redirects an invalid vehicle route to the first vehicle', () => {
    expect(getVehicleRouteRedirect(vehicles, 'missing')).toBe(
      '/vehicles/vehicle-1',
    )
  })

  it('redirects to the empty garage when no vehicles exist', () => {
    expect(getVehicleRouteRedirect([], 'missing')).toBe('/')
    expect(getVehicleRouteRedirect([])).toBeNull()
  })
})

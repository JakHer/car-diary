import { render, screen } from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

const CurrentRoute = () => {
  const location = useLocation()
  return <output>{location.pathname}</output>
}

describe('application routes', () => {
  it('redirects signed-out users to login', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute isAuthenticated={false} />}>
            <Route path="/" element={<div>Garage</div>} />
          </Route>
          <Route path="/login" element={<CurrentRoute />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('/login')).toBeInTheDocument()
    expect(screen.queryByText('Garage')).not.toBeInTheDocument()
  })

  it('renders protected content for signed-in users', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute isAuthenticated />}>
            <Route path="/" element={<div>Garage</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Garage')).toBeInTheDocument()
  })

  it('redirects signed-in users away from login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicOnlyRoute isAuthenticated />}>
            <Route path="/login" element={<div>Login</div>} />
          </Route>
          <Route path="/" element={<CurrentRoute />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
  })
})

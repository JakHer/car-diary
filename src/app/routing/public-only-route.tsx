import { Navigate, Outlet, useLocation } from 'react-router-dom'

interface RedirectState {
  from?: {
    pathname?: string
  }
}

interface PublicOnlyRouteProps {
  isAuthenticated: boolean
}

export const PublicOnlyRoute = ({
  isAuthenticated,
}: PublicOnlyRouteProps) => {
  const location = useLocation()
  const state = location.state as RedirectState | null
  const destination = state?.from?.pathname ?? '/'

  return isAuthenticated ? <Navigate replace to={destination} /> : <Outlet />
}

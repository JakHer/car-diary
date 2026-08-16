import { Navigate, Outlet, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  isAuthenticated: boolean
}

export const ProtectedRoute = ({
  isAuthenticated,
}: ProtectedRouteProps) => {
  const location = useLocation()

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate replace state={{ from: location }} to="/login" />
  )
}

import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import {
  ConfigurationScreen,
  LoadingScreen,
} from '@/components/feedback/status-screen'
import { ProtectedRoute } from './routing/protected-route'
import { PublicOnlyRoute } from './routing/public-only-route'
import { useAuth } from '@/hooks/use-auth'
import { useAccountPreferences } from '@/hooks/use-account-preferences'
import { getAccountActiveVehicleId } from '@/lib/account-preferences'
import { queryClient } from '@/lib/query-client'
import { appToast } from '@/lib/app-toast'
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from '@/lib/supabase'

const CarDiaryApp = lazy(() => import('@/pages/garage/car-diary-app'))
const SettingsPage = lazy(() =>
  import('@/pages/settings/settings-page').then(({ SettingsPage: Component }) => ({
    default: Component,
  })),
)
const AuthScreen = lazy(() =>
  import('@/pages/login/auth-screen').then(({ AuthScreen: Component }) => ({
    default: Component,
  })),
)

const getUserName = (metadata: Record<string, unknown>): string | undefined => {
  const name = metadata.given_name ?? metadata.full_name ?? metadata.name
  return typeof name === 'string' && name.trim() ? name.trim() : undefined
}

const App = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { session, isLoading } = useAuth()
  const defaultDistanceUnit = useAccountPreferences(session?.user)

  if (!isSupabaseConfigured) return <ConfigurationScreen />
  if (isLoading) return <LoadingScreen message={t('app.checkingSession')} />
  const signOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut()
    if (error) {
      appToast.error(t('header.signOutError'), error.message)
      return
    }

    queryClient.clear()
  }
  const carDiaryElement = session ? (
    <CarDiaryApp
      defaultDistanceUnit={defaultDistanceUnit}
      initialActiveVehicleId={getAccountActiveVehicleId(session.user)}
      userId={session.user.id}
      userEmail={session.user.email ?? t('app.signedInAccount')}
      userName={getUserName(session.user.user_metadata)}
      onSignOut={signOut}
    />
  ) : null

  return (
    <Suspense
      fallback={
        <LoadingScreen
          message={
            session
              ? location.pathname === '/settings'
                ? t('settings.loading')
                : t('app.loadingGarage')
              : t('app.loadingSignIn')
          }
        />
      }
    >
      <Routes>
        <Route
          element={<PublicOnlyRoute isAuthenticated={Boolean(session)} />}
        >
          <Route path="/login" element={<AuthScreen />} />
        </Route>

        <Route
          element={<ProtectedRoute isAuthenticated={Boolean(session)} />}
        >
          <Route path="/" element={carDiaryElement} />
          <Route
            path="/vehicles/:vehicleId"
            element={carDiaryElement}
          />
          <Route
            path="/vehicles/:vehicleId/:section"
            element={carDiaryElement}
          />
          <Route
            path="/settings"
            element={
              session ? (
                <SettingsPage
                  defaultDistanceUnit={defaultDistanceUnit}
                  user={session.user}
                  userEmail={
                    session.user.email ?? t('app.signedInAccount')
                  }
                  onSignOut={signOut}
                />
              ) : null
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate replace to={session ? '/' : '/login'} />}
        />
      </Routes>
    </Suspense>
  )
}

export default App

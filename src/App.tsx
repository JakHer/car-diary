import { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ConfigurationScreen,
  LoadingScreen,
} from './components/StatusScreen'
import { useAuth } from './hooks/useAuth'
import { useAccountLanguage } from './hooks/useAccountLanguage'
import { queryClient } from './lib/queryClient'
import {
  getSupabaseClient,
  isSupabaseConfigured,
} from './lib/supabase'

const CarDiaryApp = lazy(() => import('./CarDiaryApp'))
const AuthScreen = lazy(() =>
  import('./components/AuthScreen').then(({ AuthScreen: Component }) => ({
    default: Component,
  })),
)

const App = () => {
  const { t } = useTranslation()
  const { session, isLoading } = useAuth()
  useAccountLanguage(session?.user)

  if (!isSupabaseConfigured) return <ConfigurationScreen />
  if (isLoading) return <LoadingScreen message={t('app.checkingSession')} />
  if (!session) {
    return (
      <Suspense fallback={<LoadingScreen message={t('app.loadingSignIn')} />}>
        <AuthScreen />
      </Suspense>
    )
  }

  const signOut = async () => {
    const { error } = await getSupabaseClient().auth.signOut()
    if (error) {
      window.alert(error.message)
      return
    }

    queryClient.clear()
  }

  return (
    <Suspense fallback={<LoadingScreen message={t('app.loadingGarage')} />}>
      <CarDiaryApp
        userId={session.user.id}
        userEmail={session.user.email ?? t('app.signedInAccount')}
        onSignOut={signOut}
      />
    </Suspense>
  )
}

export default App

import { lazy, Suspense } from 'react'
import {
  ConfigurationScreen,
  LoadingScreen,
} from './components/StatusScreen'
import { useAuth } from './hooks/useAuth'
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
  const { session, isLoading } = useAuth()

  if (!isSupabaseConfigured) return <ConfigurationScreen />
  if (isLoading) return <LoadingScreen message="Checking your session..." />
  if (!session) {
    return (
      <Suspense fallback={<LoadingScreen message="Loading sign in..." />}>
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
    <Suspense fallback={<LoadingScreen message="Loading your garage..." />}>
      <CarDiaryApp
        userId={session.user.id}
        userEmail={session.user.email ?? 'Signed-in account'}
        onSignOut={signOut}
      />
    </Suspense>
  )
}

export default App

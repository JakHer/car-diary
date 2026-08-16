import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/manrope/wght.css'
import './index.css'
import './i18n'
import App from './app/app.tsx'
import { AppToaster } from './components/feedback/app-toaster'
import { queryClient } from './lib/query-client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <AppToaster />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)

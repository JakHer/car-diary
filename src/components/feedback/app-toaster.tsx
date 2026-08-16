import { Toaster } from 'sonner'

export const AppToaster = () => (
  <Toaster
    closeButton
    expand
    position="top-right"
    richColors
    toastOptions={{
      duration: 5_000,
      classNames: {
        toast: 'font-sans shadow-card',
      },
    }}
  />
)

import { toast } from 'sonner'

const showError = (message: string, description?: string) =>
  toast.error(message, { description })

const showSuccess = (message: string, description?: string) =>
  toast.success(message, { description })

export const appToast = {
  error: showError,
  success: showSuccess,
}

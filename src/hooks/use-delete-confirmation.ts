import { useCallback, useState } from 'react'

interface DeleteConfirmationRequest {
  description: string
  title: string
  onConfirm: () => Promise<void>
}

export const useDeleteConfirmation = () => {
  const [confirmation, setConfirmation] =
    useState<DeleteConfirmationRequest | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const requestDeletion = useCallback(
    (request: DeleteConfirmationRequest) => setConfirmation(request),
    [],
  )

  const closeDeleteConfirmation = useCallback(() => {
    if (!isConfirming) setConfirmation(null)
  }, [isConfirming])

  const confirmDeletion = useCallback(() => {
    if (!confirmation || isConfirming) return

    setIsConfirming(true)
    void confirmation
      .onConfirm()
      .catch(() => undefined)
      .finally(() => {
        setIsConfirming(false)
        setConfirmation(null)
      })
  }, [confirmation, isConfirming])

  return {
    closeDeleteConfirmation,
    confirmation,
    confirmDeletion,
    isConfirming,
    requestDeletion,
  }
}

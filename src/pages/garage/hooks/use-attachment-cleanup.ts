import { useTranslation } from 'react-i18next'
import { removeAttachmentFiles } from '@/features/attachments/attachment-storage'
import { appToast } from '@/lib/app-toast'

export type AttachmentCleanup = (storagePaths: string[]) => Promise<void>

export const useAttachmentCleanup = (): AttachmentCleanup => {
  const { t } = useTranslation()

  return async (storagePaths) => {
    try {
      await removeAttachmentFiles(storagePaths)
    } catch (error) {
      appToast.error(t('notifications.attachmentCleanupFailed'))
      throw error
    }
  }
}

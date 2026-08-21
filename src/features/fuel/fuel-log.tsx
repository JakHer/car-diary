import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import type {
  DistanceUnit,
  FuelAttachment,
  FuelEntry,
  FuelEntryInput,
} from '@/types'
import { getIntlLocale } from '@/i18n'
import { IconButton } from '@/components/actions/icon-button'
import { DashboardSection } from '@/components/layout/dashboard-section'
import { FormDialog } from '@/components/overlays/form-dialog'
import { Badge } from '@/components/ui/badge'
import { FuelEntryForm } from './fuel-entry-form'
import { FuelEntryList } from './fuel-entry-list'
import { FuelSummary } from './fuel-summary'

interface FuelLogProps {
  attachments: FuelAttachment[]
  currentMileage: number
  deletingAttachmentId: string | null
  distanceUnit: DistanceUnit
  entries: FuelEntry[]
  isSaving: boolean
  uploadingFuelEntryId: string | null
  onCreate: (input: FuelEntryInput) => Promise<void>
  onDelete: (fuelEntryId: string) => void
  onDeleteAttachment: (attachmentId: string) => void
  onUploadAttachment: (fuelEntryId: string, file: File) => void
}

export const FuelLog = ({
  attachments,
  currentMileage,
  deletingAttachmentId,
  distanceUnit,
  entries,
  isSaving,
  uploadingFuelEntryId,
  onCreate,
  onDelete,
  onDeleteAttachment,
  onUploadAttachment,
}: FuelLogProps) => {
  const { i18n, t } = useTranslation()
  const [formOpen, setFormOpen] = useState(false)
  const locale = getIntlLocale(i18n.resolvedLanguage)

  return (
    <DashboardSection
      actions={
        <>
          <Badge className="whitespace-nowrap" variant="secondary">
            {t('fuel.entryCount', { count: entries.length })}
          </Badge>
          <IconButton
            label={t('fuel.add')}
            tooltipSide="bottom"
            variant="primary"
            onClick={() => setFormOpen(true)}
          >
            <Plus aria-hidden="true" className="size-4" />
          </IconButton>
        </>
      }
      className="mt-6"
      contentClassName="mt-[22px]"
      eyebrow={t('fuel.eyebrow')}
      title={t('fuel.title')}
      titleId="fuel-log-title"
    >
      {entries.length > 0 && (
        <FuelSummary
          distanceUnit={distanceUnit}
          entries={entries}
          locale={locale}
        />
      )}
      <FuelEntryList
        attachments={attachments}
        deletingAttachmentId={deletingAttachmentId}
        distanceUnit={distanceUnit}
        entries={entries}
        locale={locale}
        uploadingFuelEntryId={uploadingFuelEntryId}
        onDelete={onDelete}
        onDeleteAttachment={onDeleteAttachment}
        onUploadAttachment={onUploadAttachment}
      />

      <FormDialog
        closeLabel={t('fuel.close')}
        description={t('fuel.addDescription')}
        isBusy={isSaving}
        open={formOpen}
        title={t('fuel.add')}
        onOpenChange={setFormOpen}
      >
        <FuelEntryForm
          currentMileage={currentMileage}
          distanceUnit={distanceUnit}
          isSaving={isSaving}
          onCreate={onCreate}
          onCreated={() => setFormOpen(false)}
        />
      </FormDialog>
    </DashboardSection>
  )
}

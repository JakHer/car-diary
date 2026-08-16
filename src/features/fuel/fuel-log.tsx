import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import type { DistanceUnit, FuelEntry, FuelEntryInput } from '@/types'
import { getIntlLocale } from '@/i18n'
import { IconButton } from '@/components/actions/icon-button'
import { FormDialog } from '@/components/overlays/form-dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FuelEntryForm } from './fuel-entry-form'
import { FuelEntryList } from './fuel-entry-list'
import { FuelSummary } from './fuel-summary'

interface FuelLogProps {
  currentMileage: number
  distanceUnit: DistanceUnit
  entries: FuelEntry[]
  isSaving: boolean
  onCreate: (input: FuelEntryInput) => Promise<void>
  onDelete: (fuelEntryId: string) => void
}

export const FuelLog = ({
  currentMileage,
  distanceUnit,
  entries,
  isSaving,
  onCreate,
  onDelete,
}: FuelLogProps) => {
  const { i18n, t } = useTranslation()
  const [formOpen, setFormOpen] = useState(false)
  const locale = getIntlLocale(i18n.resolvedLanguage)

  return (
    <section
      className={cn(
        'rounded-large border border-border bg-surface shadow-card',
        'mt-6 p-7 max-[700px]:p-[22px]',
      )}
      aria-labelledby="fuel-log-title"
    >
      <div
        className={cn(
          'flex items-start justify-between gap-5',
          'border-b border-border pb-[22px]',
        )}
      >
        <div>
          <p className="m-0 mb-2.5 text-xs font-extrabold tracking-[0.09em] text-accent uppercase">
            {t('fuel.eyebrow')}
          </p>
          <h2
            className="m-0 text-[22px] font-bold tracking-[-0.025em] text-strong"
            id="fuel-log-title"
          >
            {t('fuel.title')}
          </h2>
        </div>
        <div className="flex items-center justify-end gap-2">
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
        </div>
      </div>

      <div className="mt-[22px]">
        {entries.length > 0 && (
          <FuelSummary
            distanceUnit={distanceUnit}
            entries={entries}
            locale={locale}
          />
        )}
        <FuelEntryList
          distanceUnit={distanceUnit}
          entries={entries}
          locale={locale}
          onDelete={onDelete}
        />
      </div>

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
    </section>
  )
}

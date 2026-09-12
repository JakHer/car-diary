import { useTranslation } from 'react-i18next'
import type {
  FuelEntryInput,
  MaintenanceReminderInput,
  ServiceRecordInput,
  Vehicle,
} from '@/types'
import { FuelEntryForm } from '@/features/fuel/fuel-entry-form'
import { MaintenanceReminderForm } from '@/features/reminders/maintenance-reminder-form'
import { ServiceForm } from '@/features/service-records/service-form'
import { FormDialog } from '@/components/overlays/form-dialog'
import type { HomeAction } from '../home-dashboard.types'

interface HomeActionDialogsProps {
  action: HomeAction
  isCreatingFuelEntry: boolean
  isCreatingReminder: boolean
  isSavingRecord: boolean
  vehicle: Vehicle
  onActionChange: (action: HomeAction) => void
  onCreateFuelEntry: (input: FuelEntryInput) => Promise<void>
  onCreateReminder: (input: MaintenanceReminderInput) => Promise<void>
  onCreateServiceRecord: (input: ServiceRecordInput) => Promise<void>
}

export const HomeActionDialogs = ({
  action,
  isCreatingFuelEntry,
  isCreatingReminder,
  isSavingRecord,
  vehicle,
  onActionChange,
  onCreateFuelEntry,
  onCreateReminder,
  onCreateServiceRecord,
}: HomeActionDialogsProps) => {
  const { t } = useTranslation()
  const closeAction = () => onActionChange(null)
  const saveServiceRecord = async (input: ServiceRecordInput) => {
    await onCreateServiceRecord(input)
    closeAction()
  }

  return (
    <>
      <FormDialog
        closeLabel={t('fuel.close')}
        description={t('fuel.addDescription')}
        isBusy={isCreatingFuelEntry}
        open={action === 'fuel'}
        title={t('fuel.add')}
        onOpenChange={(open) => onActionChange(open ? 'fuel' : null)}
      >
        <FuelEntryForm
          key={action === 'fuel' ? 'fuel-open' : 'fuel-closed'}
          currentMileage={vehicle.currentMileage}
          distanceUnit={vehicle.distanceUnit}
          isSaving={isCreatingFuelEntry}
          onSave={onCreateFuelEntry}
          onSaved={closeAction}
        />
      </FormDialog>

      <FormDialog
        closeLabel={t('service.close')}
        description={t('service.addDescription')}
        isBusy={isSavingRecord}
        open={action === 'service'}
        title={t('service.addTitle')}
        onOpenChange={(open) => onActionChange(open ? 'service' : null)}
      >
        <ServiceForm
          key={action === 'service' ? 'service-open' : 'service-closed'}
          currentMileage={vehicle.currentMileage}
          distanceUnit={vehicle.distanceUnit}
          embedded
          isSaving={isSavingRecord}
          onCancel={closeAction}
          onSave={saveServiceRecord}
        />
      </FormDialog>

      <FormDialog
        closeLabel={t('reminders.close')}
        description={t('reminders.addDescription')}
        isBusy={isCreatingReminder}
        open={action === 'reminder'}
        title={t('reminders.add')}
        onOpenChange={(open) => onActionChange(open ? 'reminder' : null)}
      >
        <MaintenanceReminderForm
          key={action === 'reminder' ? 'reminder-open' : 'reminder-closed'}
          currentMileage={vehicle.currentMileage}
          distanceUnit={vehicle.distanceUnit}
          isSaving={isCreatingReminder}
          onSave={onCreateReminder}
          onSaved={closeAction}
        />
      </FormDialog>
    </>
  )
}

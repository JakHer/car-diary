import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  FuelEntry,
  FuelEntryInput,
  MaintenanceReminder,
  MaintenanceReminderInput,
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
} from '@/types'
import type { VehicleSection } from '@/app/routing/vehicle-routes'
import { getIntlLocale } from '@/i18n'
import { PageHeader } from '@/components/layout/page-header'
import { PageLayout } from '@/components/layout/page-layout'
import { ActiveVehicleCard } from './components/active-vehicle-card'
import { HomeActionDialogs } from './components/home-action-dialogs'
import { QuickActions } from './components/quick-actions'
import { RecentActivity } from './components/recent-activity'
import { UpcomingReminders } from './components/upcoming-reminders'
import type { HomeAction } from './home-dashboard.types'

interface HomeDashboardProps {
  fuelEntries: FuelEntry[]
  isCreatingFuelEntry: boolean
  isCreatingReminder: boolean
  isSavingRecord: boolean
  isUpdatingMileage: boolean
  records: ServiceRecord[]
  reminders: MaintenanceReminder[]
  userName?: string
  vehicle: Vehicle
  onCreateFuelEntry: (input: FuelEntryInput) => Promise<void>
  onCreateReminder: (input: MaintenanceReminderInput) => Promise<void>
  onCreateServiceRecord: (input: ServiceRecordInput) => Promise<void>
  onEditVehicle: () => void
  onOpenVehicle: () => void
  onOpenVehicleSection: (
    section: Exclude<VehicleSection, 'overview'>,
  ) => void
  onUpdateMileage: (currentMileage: number) => Promise<void>
}

export const HomeDashboard = ({
  fuelEntries,
  isCreatingFuelEntry,
  isCreatingReminder,
  isSavingRecord,
  isUpdatingMileage,
  records,
  reminders,
  userName,
  vehicle,
  onCreateFuelEntry,
  onCreateReminder,
  onCreateServiceRecord,
  onEditVehicle,
  onOpenVehicle,
  onOpenVehicleSection,
  onUpdateMileage,
}: HomeDashboardProps) => {
  const { i18n, t } = useTranslation()
  const [action, setAction] = useState<HomeAction>(null)
  const locale = getIntlLocale(i18n.resolvedLanguage)

  return (
    <PageLayout>
      <PageHeader
        aside={
          <ActiveVehicleCard
            locale={locale}
            vehicle={vehicle}
            onEditVehicle={onEditVehicle}
            onOpenVehicle={onOpenVehicle}
          />
        }
        description={t('home.description')}
        eyebrow={t('home.eyebrow')}
        size="display"
        title={
          <>
            {userName
              ? t('home.greetingWithName', { name: userName })
              : t('home.greeting')}{' '}
            <span className="block text-accent">{t('home.question')}</span>
          </>
        }
      />

      <QuickActions
        isUpdatingMileage={isUpdatingMileage}
        vehicle={vehicle}
        onActionChange={setAction}
        onUpdateMileage={onUpdateMileage}
      />

      <div className="mt-6 grid grid-cols-2 items-start gap-6 max-[800px]:grid-cols-1">
        <UpcomingReminders
          locale={locale}
          reminders={reminders}
          vehicle={vehicle}
          onOpenVehicleSection={onOpenVehicleSection}
        />
        <RecentActivity
          fuelEntries={fuelEntries}
          locale={locale}
          records={records}
          onOpenVehicleSection={onOpenVehicleSection}
        />
      </div>

      <HomeActionDialogs
        action={action}
        isCreatingFuelEntry={isCreatingFuelEntry}
        isCreatingReminder={isCreatingReminder}
        isSavingRecord={isSavingRecord}
        vehicle={vehicle}
        onActionChange={setAction}
        onCreateFuelEntry={onCreateFuelEntry}
        onCreateReminder={onCreateReminder}
        onCreateServiceRecord={onCreateServiceRecord}
      />
    </PageLayout>
  )
}

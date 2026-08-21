import { useMemo, useState, type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpRight,
  BellRing,
  Fuel,
  Gauge,
  Wrench,
} from 'lucide-react'
import type {
  FuelEntry,
  FuelEntryInput,
  MaintenanceReminder,
  MaintenanceReminderInput,
  ServiceRecord,
  ServiceRecordInput,
  Vehicle,
} from '@/types'
import { getIntlLocale } from '@/i18n'
import { formatDistance } from '@/lib/distance-units'
import { getMaintenanceReminderStatus } from '@/lib/maintenance-reminders'
import { FuelEntryForm } from '@/features/fuel/fuel-entry-form'
import { MaintenanceReminderForm } from '@/features/reminders/maintenance-reminder-form'
import { ServiceForm } from '@/features/service-records/service-form'
import { MileageDialog } from '@/features/vehicles/mileage-dialog'
import { DashboardSection } from '@/components/layout/dashboard-section'
import { PageHeader } from '@/components/layout/page-header'
import { PageLayout } from '@/components/layout/page-layout'
import { FormDialog } from '@/components/overlays/form-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type HomeAction = 'fuel' | 'reminder' | 'service' | null

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
  onOpenVehicle: () => void
  onUpdateMileage: (currentMileage: number) => Promise<void>
}

interface QuickActionProps extends Omit<ComponentProps<typeof Button>, 'children'> {
  description: string
  icon: LucideIcon
  label: string
}

const QuickAction = ({
  description,
  icon: Icon,
  label,
  ...buttonProps
}: QuickActionProps) => (
  <Button
    className="group grid h-full min-h-40 w-full grid-cols-1 grid-rows-[44px_auto_1fr] items-start justify-items-start gap-y-4 whitespace-normal rounded-large border-border bg-surface p-5 text-left shadow-card hover:border-accent hover:bg-accent-soft/35"
    type="button"
    variant="outline"
    {...buttonProps}
  >
    <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white">
      <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
    </span>
    <strong className="flex items-center gap-2 self-start text-base text-strong">
      {label}
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
      />
    </strong>
    <span className="block self-start text-xs leading-relaxed font-medium text-muted">
      {description}
    </span>
  </Button>
)

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
  onOpenVehicle,
  onUpdateMileage,
}: HomeDashboardProps) => {
  const { i18n, t } = useTranslation()
  const [action, setAction] = useState<HomeAction>(null)
  const locale = getIntlLocale(i18n.resolvedLanguage)
  const vehicleName = `${vehicle.make} ${vehicle.model}`
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  )
  const volumeFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
      }),
    [locale],
  )
  const upcomingReminders = reminders
    .filter((reminder) => !reminder.completedAt)
    .toSorted((first, second) => {
      const firstStatus = getMaintenanceReminderStatus(
        first,
        vehicle.currentMileage,
      )
      const secondStatus = getMaintenanceReminderStatus(
        second,
        vehicle.currentMileage,
      )
      if (firstStatus !== secondStatus) {
        return firstStatus === 'overdue' ? -1 : 1
      }

      return (first.dueDate ?? '9999-12-31').localeCompare(
        second.dueDate ?? '9999-12-31',
      )
    })
    .slice(0, 3)
  const recentActivity = [
    ...records.map((record) => ({
      date: record.date,
      id: `service-${record.id}`,
      title: record.title,
      type: 'service' as const,
    })),
    ...fuelEntries.map((entry) => ({
      date: entry.date,
      id: `fuel-${entry.id}`,
      title: t('home.fuelActivity', {
        volume: volumeFormatter.format(entry.volumeInMilliliters / 1_000),
      }),
      type: 'fuel' as const,
    })),
  ]
    .toSorted((first, second) => second.date.localeCompare(first.date))
    .slice(0, 4)
  const closeAction = () => setAction(null)
  const saveServiceRecord = async (input: ServiceRecordInput) => {
    await onCreateServiceRecord(input)
    closeAction()
  }

  return (
    <PageLayout>
      <PageHeader
        aside={
          <div className="min-w-[270px] rounded-large border border-border bg-surface p-5 shadow-card max-[700px]:w-full">
            <span className="text-[11px] font-extrabold tracking-[0.07em] text-accent uppercase">
              {t('home.activeVehicle')}
            </span>
            <strong className="mt-2 block text-xl text-strong">
              {vehicleName}
            </strong>
            <span className="mt-1 block text-sm text-muted">
              {formatDistance(
                vehicle.currentMileage,
                vehicle.distanceUnit,
                locale,
              )}
            </span>
            <Button
              className="mt-4 h-auto p-0 text-xs"
              type="button"
              variant="link"
              onClick={onOpenVehicle}
            >
              {t('home.openVehicle')}
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Button>
          </div>
        }
        description={t('home.description')}
        eyebrow={t('home.eyebrow')}
        size="display"
        title={
          <>
            {userName
              ? t('home.greetingWithName', { name: userName })
              : t('home.greeting')}
            {' '}
            <span className="block text-accent">{t('home.question')}</span>
          </>
        }
      />

      <section
        className="mt-11 grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1"
        aria-label={t('home.quickActions')}
      >
        <QuickAction
          description={t('home.fuelDescription')}
          icon={Fuel}
          label={t('fuel.add')}
          onClick={() => setAction('fuel')}
        />
        <QuickAction
          description={t('home.serviceDescription')}
          icon={Wrench}
          label={t('home.addService')}
          onClick={() => setAction('service')}
        />
        <MileageDialog
          currentMileage={vehicle.currentMileage}
          distanceUnit={vehicle.distanceUnit}
          isSaving={isUpdatingMileage}
          triggerContent={
            <QuickAction
              description={t('home.mileageDescription')}
              icon={Gauge}
              label={t('mileage.trigger')}
            />
          }
          vehicleName={vehicleName}
          onSave={onUpdateMileage}
        />
        <QuickAction
          description={t('home.reminderDescription')}
          icon={BellRing}
          label={t('reminders.add')}
          onClick={() => setAction('reminder')}
        />
      </section>

      <div className="mt-6 grid grid-cols-2 items-start gap-6 max-[800px]:grid-cols-1">
        <DashboardSection
          actions={
            <Badge variant="secondary">{upcomingReminders.length}</Badge>
          }
          contentClassName="mt-2"
          eyebrow={t('home.planEyebrow')}
          title={t('home.upcomingTitle')}
          titleId="home-reminders-title"
        >
          {upcomingReminders.length === 0 ? (
            <p className="my-8 text-center text-sm text-muted">
              {t('home.noUpcoming')}
            </p>
          ) : (
            <ul className="m-0 list-none p-0">
              {upcomingReminders.map((reminder) => {
                const status = getMaintenanceReminderStatus(
                  reminder,
                  vehicle.currentMileage,
                )
                const targets = [
                  reminder.dueDate
                    ? dateFormatter.format(
                        new Date(`${reminder.dueDate}T12:00:00`),
                      )
                    : null,
                  reminder.dueMileage !== null
                    ? formatDistance(
                        reminder.dueMileage,
                        vehicle.distanceUnit,
                        locale,
                      )
                    : null,
                ].filter(Boolean)

                return (
                  <li
                    className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-b-0"
                    key={reminder.id}
                  >
                    <div>
                      <strong className="text-sm text-strong">
                        {reminder.title}
                      </strong>
                      <span className="mt-1 block text-xs text-muted">
                        {targets.join(' · ')}
                      </span>
                    </div>
                    <Badge variant={status === 'overdue' ? 'danger' : 'success'}>
                      {t(
                        status === 'overdue'
                          ? 'reminders.dueNow'
                          : 'reminders.upcoming',
                      )}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </DashboardSection>

        <DashboardSection
          actions={<Badge variant="secondary">{recentActivity.length}</Badge>}
          contentClassName="mt-2"
          eyebrow={t('home.activityEyebrow')}
          title={t('home.recentTitle')}
          titleId="home-activity-title"
        >
          {recentActivity.length === 0 ? (
            <p className="my-8 text-center text-sm text-muted">
              {t('home.noActivity')}
            </p>
          ) : (
            <ul className="m-0 list-none p-0">
              {recentActivity.map((activity) => {
                const Icon = activity.type === 'fuel' ? Fuel : Wrench

                return (
                  <li
                    className="flex items-center gap-3 border-b border-border py-4 last:border-b-0"
                    key={activity.id}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-muted text-muted">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <div>
                      <strong className="text-sm text-strong">
                        {activity.title}
                      </strong>
                      <span className="mt-1 block text-xs text-muted">
                        {dateFormatter.format(
                          new Date(`${activity.date}T12:00:00`),
                        )}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </DashboardSection>
      </div>

      <FormDialog
        closeLabel={t('fuel.close')}
        description={t('fuel.addDescription')}
        isBusy={isCreatingFuelEntry}
        open={action === 'fuel'}
        title={t('fuel.add')}
        onOpenChange={(open) => setAction(open ? 'fuel' : null)}
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
        onOpenChange={(open) => setAction(open ? 'service' : null)}
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
        onOpenChange={(open) => setAction(open ? 'reminder' : null)}
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
    </PageLayout>
  )
}

import type { ComponentProps } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, BellRing, Fuel, Gauge, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Vehicle } from '@/types'
import { MileageDialog } from '@/features/vehicles/mileage-dialog'
import { Button } from '@/components/ui/button'
import type { HomeAction } from '../home-dashboard.types'

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

interface QuickActionsProps {
  isUpdatingMileage: boolean
  vehicle: Vehicle
  onActionChange: (action: HomeAction) => void
  onUpdateMileage: (currentMileage: number) => Promise<void>
}

export const QuickActions = ({
  isUpdatingMileage,
  vehicle,
  onActionChange,
  onUpdateMileage,
}: QuickActionsProps) => {
  const { t } = useTranslation()
  const vehicleName = `${vehicle.make} ${vehicle.model}`

  return (
    <section
      className="mt-11 grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1"
      aria-label={t('home.quickActions')}
    >
      <QuickAction
        description={t('home.fuelDescription')}
        icon={Fuel}
        label={t('fuel.add')}
        onClick={() => onActionChange('fuel')}
      />
      <QuickAction
        description={t('home.serviceDescription')}
        icon={Wrench}
        label={t('home.addService')}
        onClick={() => onActionChange('service')}
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
        onClick={() => onActionChange('reminder')}
      />
    </section>
  )
}

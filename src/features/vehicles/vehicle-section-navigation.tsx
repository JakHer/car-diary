import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'
import { BellRing, Fuel, LayoutDashboard, Wrench } from 'lucide-react'
import {
  getVehicleSectionPath,
  type VehicleSection,
} from '@/app/routing/vehicle-routes'
import { cn } from '@/lib/utils'

interface VehicleSectionNavigationProps {
  vehicleId: string
}

const sections = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'service', icon: Wrench },
  { id: 'fuel', icon: Fuel },
  { id: 'reminders', icon: BellRing },
] satisfies Array<{ id: VehicleSection; icon: typeof LayoutDashboard }>

export const VehicleSectionNavigation = ({
  vehicleId,
}: VehicleSectionNavigationProps) => {
  const { t } = useTranslation()

  return (
    <nav
      className="mt-9 overflow-x-auto border-b border-border"
      aria-label={t('vehicleSections.navigation')}
    >
      <div className="flex min-w-max gap-1">
        {sections.map(({ id, icon: Icon }) => (
          <NavLink
            className={({ isActive }) =>
              cn(
                'relative inline-flex min-h-12 items-center gap-2 px-4 text-sm font-bold text-muted no-underline transition-colors hover:text-strong',
                isActive &&
                  'text-accent after:absolute after:right-3 after:bottom-0 after:left-3 after:h-0.5 after:rounded-full after:bg-accent',
              )
            }
            end={id === 'overview'}
            key={id}
            to={getVehicleSectionPath(vehicleId, id)}
          >
            <Icon aria-hidden="true" className="size-4" strokeWidth={1.9} />
            {t(`vehicleSections.${id}`)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

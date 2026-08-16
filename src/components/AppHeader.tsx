import type { Vehicle } from '../types'
import { useTranslation } from 'react-i18next'
import { LogOut, Plus, Settings } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { LanguageSwitcher } from './LanguageSwitcher'
import { VehicleSelect } from './VehicleSelect'
import { IconButton } from './IconButton'
import { Tooltip } from './Tooltip'
import { getVehiclePath } from '../routing/vehicleRoutes'
import {
  brandMarkStyles,
  brandStyles,
  iconActionStyles,
  joinClassNames,
} from '../styles'

interface AppHeaderProps {
  activeVehicle?: Vehicle
  userEmail: string
  vehicles?: Vehicle[]
  onAddVehicle?: () => void
  onSelectVehicle?: (vehicleId: string) => void
  onSignOut: () => Promise<void>
}

export const AppHeader = ({
  activeVehicle,
  userEmail,
  vehicles = [],
  onAddVehicle,
  onSelectVehicle,
  onSignOut,
}: AppHeaderProps) => {
  const { t } = useTranslation()

  return (
  <header className="flex min-h-20 items-center justify-between gap-6 border-b border-border max-[700px]:min-h-0 max-[700px]:flex-wrap max-[700px]:gap-3 max-[700px]:py-3">
    <Link
      className={brandStyles}
      to={activeVehicle ? getVehiclePath(activeVehicle.id) : '/'}
      aria-label={t('common.homeAria')}
    >
      <span className={brandMarkStyles} aria-hidden="true">
        CD
      </span>
      <span>{t('common.appName')}</span>
    </Link>
    <div className="flex shrink-0 items-center gap-3 max-[700px]:w-full max-[700px]:justify-between max-[700px]:gap-[7px]">
      {activeVehicle && onAddVehicle && onSelectVehicle && (
        <div className="flex shrink-0 items-center gap-3 border-r border-border pr-3 max-[700px]:gap-[7px] max-[700px]:border-r-0 max-[700px]:pr-0">
          <VehicleSelect
            activeVehicleId={activeVehicle.id}
            vehicles={vehicles}
            onSelect={onSelectVehicle}
          />
          <IconButton label={t('header.add')} onClick={onAddVehicle}>
            <Plus aria-hidden="true" className="size-4" strokeWidth={2.2} />
          </IconButton>
        </div>
      )}
      <LanguageSwitcher syncWithAccount />
      <Tooltip label={t('header.settings')}>
        <NavLink
          className={({ isActive }) =>
            joinClassNames(
              iconActionStyles,
              'no-underline',
              isActive && 'border-accent bg-accent-soft text-accent',
            )
          }
          to="/settings"
          aria-label={t('header.settings')}
        >
          <Settings aria-hidden="true" className="size-4" strokeWidth={2} />
        </NavLink>
      </Tooltip>
      <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted max-[700px]:hidden">
        <span
          className="size-[7px] rounded-full bg-accent shadow-[0_0_0_4px_var(--color-accent-soft)]"
          aria-hidden="true"
        />{' '}
        Supabase
      </span>
      <div className="flex items-center gap-[9px]">
        <Tooltip label={userEmail} side="bottom">
          <span
            className="max-w-[170px] overflow-hidden text-xs text-ellipsis whitespace-nowrap text-muted outline-none focus-visible:text-strong max-[700px]:hidden"
            tabIndex={0}
          >
            {userEmail}
          </span>
        </Tooltip>
        <IconButton
          className="text-strong"
          label={t('header.signOut')}
          onClick={() => void onSignOut()}
        >
          <LogOut aria-hidden="true" className="size-4" strokeWidth={2} />
        </IconButton>
      </div>
    </div>
  </header>
  )
}

import type { Vehicle } from '../types'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { VehicleSelect } from './VehicleSelect'
import {
  brandMarkStyles,
  brandStyles,
  joinClassNames,
  secondaryButtonStyles,
} from '../styles'

interface AppHeaderProps {
  activeVehicle: Vehicle | undefined
  userEmail: string
  vehicles: Vehicle[]
  onAddVehicle: () => void
  onSelectVehicle: (vehicleId: string) => void
  onSignOut: () => Promise<void>
}

export const AppHeader = ({
  activeVehicle,
  userEmail,
  vehicles,
  onAddVehicle,
  onSelectVehicle,
  onSignOut,
}: AppHeaderProps) => {
  const { t } = useTranslation()

  return (
  <header className="flex min-h-20 items-center justify-between gap-6 border-b border-border max-[700px]:min-h-0 max-[700px]:flex-wrap max-[700px]:gap-3 max-[700px]:py-3">
    <a className={brandStyles} href="/" aria-label={t('common.homeAria')}>
      <span className={brandMarkStyles} aria-hidden="true">
        CD
      </span>
      <span>{t('common.appName')}</span>
    </a>
    <div className="flex items-center gap-3 max-[700px]:w-full max-[700px]:justify-between max-[700px]:gap-[7px]">
      {activeVehicle && (
        <div className="flex items-center gap-3 border-r border-border pr-3 max-[700px]:gap-[7px] max-[700px]:border-r-0 max-[700px]:pr-0">
          <VehicleSelect
            activeVehicleId={activeVehicle.id}
            vehicles={vehicles}
            onSelect={onSelectVehicle}
          />
          <button
            className={joinClassNames(
              secondaryButtonStyles,
              'min-h-9 px-3 text-xs',
            )}
            type="button"
            onClick={onAddVehicle}
          >
            {t('header.add')}
          </button>
        </div>
      )}
      <LanguageSwitcher syncWithAccount />
      <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted max-[700px]:hidden">
        <span
          className="size-[7px] rounded-full bg-accent shadow-[0_0_0_4px_var(--color-accent-soft)]"
          aria-hidden="true"
        />{' '}
        Supabase
      </span>
      <div className="flex items-center gap-[9px]">
        <span
          className="max-w-[170px] overflow-hidden text-xs text-ellipsis whitespace-nowrap text-muted max-[700px]:hidden"
          title={userEmail}
        >
          {userEmail}
        </span>
        <button
          className="cursor-pointer border-0 bg-transparent p-0 text-xs font-[750] text-strong hover:text-accent focus-visible:text-accent"
          type="button"
          onClick={() => void onSignOut()}
        >
          {t('header.signOut')}
        </button>
      </div>
    </div>
  </header>
  )
}

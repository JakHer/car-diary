import { ArrowUpRight, PhoneCall } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Vehicle } from '@/types'
import { formatDistance } from '@/lib/distance-units'
import { getTelephoneHref } from '@/lib/phone-numbers'
import { Button } from '@/components/ui/button'

interface ActiveVehicleCardProps {
  locale: string
  vehicle: Vehicle
  onEditVehicle: () => void
  onOpenVehicle: () => void
}

export const ActiveVehicleCard = ({
  locale,
  vehicle,
  onEditVehicle,
  onOpenVehicle,
}: ActiveVehicleCardProps) => {
  const { t } = useTranslation()
  const vehicleName = `${vehicle.make} ${vehicle.model}`

  return (
    <div className="min-w-[290px] overflow-hidden rounded-large border border-border bg-surface shadow-card max-[700px]:w-full">
      <Button
        className="group h-auto w-full flex-col items-stretch gap-0 whitespace-normal rounded-none border-0 bg-transparent p-5 text-left shadow-none hover:bg-accent-soft/25"
        type="button"
        variant="outline"
        onClick={onOpenVehicle}
      >
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
        <span className="mt-4 flex items-center gap-2 text-xs font-bold text-accent">
          {t('home.openVehicle')}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </Button>

      {vehicle.assistancePhone ? (
        <a
          className="group flex min-h-14 items-center gap-3 border-t border-border px-5 py-3 text-strong no-underline transition-colors hover:bg-accent-soft/35"
          href={getTelephoneHref(vehicle.assistancePhone)}
        >
          <PhoneCall
            aria-hidden="true"
            className="size-4 shrink-0 text-accent"
          />
          <span className="min-w-0 flex-1">
            <strong className="block text-xs">{t('assistance.call')}</strong>
            {vehicle.insurerName && (
              <span className="mt-0.5 block truncate text-[11px] text-muted">
                {vehicle.insurerName}
              </span>
            )}
          </span>
          <span className="text-xs font-bold text-accent">
            {vehicle.assistancePhone}
          </span>
        </a>
      ) : (
        <Button
          className="h-14 w-full justify-start rounded-none border-0 border-t border-border px-5 text-xs shadow-none hover:translate-y-0"
          type="button"
          variant="ghost"
          onClick={onEditVehicle}
        >
          <PhoneCall aria-hidden="true" className="size-4 text-accent" />
          {t('assistance.add')}
        </Button>
      )}
    </div>
  )
}

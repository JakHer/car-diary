import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import type { Vehicle } from '@/types'
import { IconButton } from '@/components/actions/icon-button'
import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { MileageDialog } from './mileage-dialog'

interface VehiclePageHeaderProps {
  isUpdatingMileage: boolean
  locale: string
  vehicle: Vehicle
  onDeleteVehicle: () => void
  onEditVehicle: () => void
  onUpdateMileage: (currentMileage: number) => Promise<void>
}

export const VehiclePageHeader = ({
  isUpdatingMileage,
  locale,
  vehicle,
  onDeleteVehicle,
  onEditVehicle,
  onUpdateMileage,
}: VehiclePageHeaderProps) => {
  const { t } = useTranslation()
  const vehicleName = `${vehicle.make} ${vehicle.model}`

  return (
    <>
      <Link
        className={cn(
          buttonVariants({ variant: 'link', size: 'sm' }),
          'mb-7 h-auto gap-2 p-0 text-muted no-underline hover:text-accent',
        )}
        to="/"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t('dashboard.backHome')}
      </Link>
      <PageHeader
        aside={
          <div className="grid shrink-0 justify-items-end max-[700px]:justify-items-start">
            <span className="mb-1.5 text-xs font-bold tracking-[0.04em] text-muted uppercase">
              {t('dashboard.currentMileage')}
            </span>
            <strong className="text-[clamp(32px,5vw,48px)] leading-none tracking-[-0.04em] text-strong">
              {vehicle.currentMileage.toLocaleString(locale)}
              <small className="ml-1 text-[0.45em] tracking-normal text-muted">
                {vehicle.distanceUnit}
              </small>
            </strong>
            <MileageDialog
              currentMileage={vehicle.currentMileage}
              distanceUnit={vehicle.distanceUnit}
              isSaving={isUpdatingMileage}
              vehicleName={vehicleName}
              onSave={onUpdateMileage}
            />
          </div>
        }
        eyebrow={t('dashboard.activeVehicle')}
        size="display"
        title={vehicleName}
      >
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{vehicle.year}</Badge>
          {vehicle.registrationNumber && (
            <Badge variant="secondary">{vehicle.registrationNumber}</Badge>
          )}
          {vehicle.vin && (
            <Badge variant="secondary">VIN {vehicle.vin}</Badge>
          )}
          <div className="ml-1 flex gap-1.5 border-l border-border pl-3">
            <IconButton
              label={t('dashboard.editVehicle')}
              tooltipSide="bottom"
              onClick={onEditVehicle}
            >
              <Pencil aria-hidden="true" className="size-4" />
            </IconButton>
            <IconButton
              label={t('dashboard.deleteVehicle')}
              tooltipSide="bottom"
              variant="danger"
              onClick={onDeleteVehicle}
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </IconButton>
          </div>
        </div>
      </PageHeader>
    </>
  )
}

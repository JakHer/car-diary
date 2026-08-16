import type { ReactElement } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

interface TooltipProps {
  children: ReactElement
  label: string
  side?: 'bottom' | 'left' | 'right' | 'top'
}

export const Tooltip = ({ children, label, side = 'top' }: TooltipProps) => (
  <TooltipPrimitive.Provider delayDuration={300} skipDelayDuration={100}>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className="z-[70] select-none rounded-[7px] bg-strong px-2.5 py-1.5 text-[11px] font-bold text-white shadow-[0_8px_24px_rgba(11,18,14,0.2)]"
          collisionPadding={8}
          side={side}
          sideOffset={7}
        >
          {label}
          <TooltipPrimitive.Arrow className="fill-strong" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
)

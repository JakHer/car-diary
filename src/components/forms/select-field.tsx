import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  label: string
  value: string
}

interface SelectFieldProps {
  ariaLabel: string
  defaultValue?: string
  disabled?: boolean
  invalid?: boolean
  name?: string
  options: SelectOption[]
  value?: string
  variant?: 'form' | 'compact' | 'toolbar'
  onValueChange?: (value: string) => void
}

const compactTriggerStyles =
  'flex h-9 max-w-[190px] min-w-[132px] cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-[9px] border border-border-strong bg-surface px-2.5 text-[13px] font-bold text-strong outline-none transition-[border-color,box-shadow,background-color] hover:bg-surface-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] data-[state=open]:border-accent data-[state=open]:shadow-[0_0_0_3px_var(--color-accent-soft)] max-[700px]:min-w-0 max-[700px]:max-w-[118px]'

const toolbarTriggerStyles =
  'flex h-9 min-w-[155px] cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-[9px] border border-border-strong bg-surface px-2.5 text-[13px] font-bold text-strong outline-none transition-[border-color,box-shadow,background-color] hover:bg-surface-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] data-[state=open]:border-accent data-[state=open]:shadow-[0_0_0_3px_var(--color-accent-soft)] max-[700px]:w-full max-[700px]:min-w-0'

const formTriggerStyles =
  'flex h-[46px] w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-border-strong bg-surface px-[13px] text-left text-sm font-medium text-strong outline-none transition-[border-color,box-shadow] duration-150 focus:border-ring focus:ring-[3px] focus:ring-ring/10 aria-invalid:border-destructive/50 aria-invalid:ring-[3px] aria-invalid:ring-destructive/10 disabled:cursor-not-allowed disabled:opacity-60'

export const SelectField = ({
  ariaLabel,
  defaultValue,
  disabled = false,
  invalid = false,
  name,
  options,
  value,
  variant = 'form',
  onValueChange,
}: SelectFieldProps) => (
  <Select.Root
    defaultValue={defaultValue}
    name={name}
    value={value}
    onValueChange={onValueChange}
  >
    <Select.Trigger
      className={
        variant === 'compact'
          ? compactTriggerStyles
          : variant === 'toolbar'
            ? toolbarTriggerStyles
          : cn(formTriggerStyles)
      }
      aria-label={ariaLabel}
      aria-invalid={invalid}
      disabled={disabled}
    >
      <Select.Value className="truncate" />
      <Select.Icon className="shrink-0 text-muted">
        <ChevronDown aria-hidden="true" className="size-3.5" strokeWidth={2} />
      </Select.Icon>
    </Select.Trigger>

    <Select.Portal>
      <Select.Content
        className="z-50 max-h-[var(--radix-select-content-available-height)] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-[10px] border border-border bg-surface p-1 shadow-[0_16px_40px_rgba(24,32,28,0.16)]"
        position="popper"
        sideOffset={6}
        align="start"
      >
        <Select.Viewport>
          {options.map((option) => (
            <Select.Item
              className="relative flex h-9 cursor-pointer items-center rounded-[7px] pr-8 pl-2.5 text-[13px] font-semibold text-strong outline-none select-none data-[highlighted]:bg-accent-soft data-[highlighted]:text-accent"
              key={option.value}
              value={option.value}
            >
              <Select.ItemText>{option.label}</Select.ItemText>
              <Select.ItemIndicator className="absolute right-2.5 text-accent">
                <Check aria-hidden="true" className="size-3.5" strokeWidth={2} />
              </Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
)

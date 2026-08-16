import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Popover from '@radix-ui/react-popover'
import { DayPicker } from '@daypicker/react'
import { enGB, pl } from '@daypicker/react/locale'
import { CalendarDays } from 'lucide-react'
import { getIntlLocale } from '@/i18n'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  defaultValue?: string
  invalid?: boolean
  name: string
  required?: boolean
  value?: string
  onValueChange?: (value: string) => void
}

const parseDate = (value?: string): Date | undefined => {
  if (!value) return undefined

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return undefined

  return new Date(year, month - 1, day)
}

const formatDateValue = (date?: Date): string => {
  if (!date) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const DatePicker = ({
  defaultValue,
  invalid = false,
  name,
  required = false,
  value,
  onValueChange,
}: DatePickerProps) => {
  const { i18n, t } = useTranslation()
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const [isOpen, setIsOpen] = useState(false)
  const dateValue = value ?? internalValue
  const selectedDate = parseDate(dateValue)
  const locale = getIntlLocale(i18n.resolvedLanguage)
  const displayDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    [locale],
  )

  const selectDate = (date: Date | undefined) => {
    const nextValue = formatDateValue(date)
    if (value === undefined) setInternalValue(nextValue)
    onValueChange?.(nextValue)
    setIsOpen(false)
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <input name={name} type="hidden" value={dateValue} />
      <Popover.Trigger asChild>
        <Button
          className={cn(
            'w-full justify-between gap-3 text-left font-medium',
            !selectedDate && 'text-light',
          )}
          variant="outline"
          type="button"
          aria-invalid={invalid}
          aria-label={
            selectedDate ? t('datePicker.change') : t('datePicker.choose')
          }
        >
          <span>
            {selectedDate
              ? displayDateFormatter.format(selectedDate)
              : t('datePicker.placeholder')}
          </span>
          <span className="shrink-0 text-muted">
            <CalendarDays
              aria-hidden="true"
              className="size-4"
              strokeWidth={1.75}
            />
          </span>
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 rounded-xl border border-border bg-surface p-1 shadow-[0_16px_40px_rgba(24,32,28,0.16)]"
          align="start"
          sideOffset={6}
        >
          <DayPicker
            classNames={{
              root: 'p-3',
              months: 'relative',
              month: 'space-y-3',
              month_caption: 'flex h-9 items-center justify-center',
              caption_label: 'text-sm font-extrabold text-strong',
              nav: 'absolute top-3 right-3 left-3 flex justify-between',
              button_previous:
                'grid size-9 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-muted outline-none hover:bg-surface-muted hover:text-strong focus-visible:shadow-[0_0_0_3px_var(--color-accent-soft)]',
              button_next:
                'grid size-9 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-muted outline-none hover:bg-surface-muted hover:text-strong focus-visible:shadow-[0_0_0_3px_var(--color-accent-soft)]',
              chevron: 'size-4 fill-current',
              month_grid: 'w-full border-collapse',
              weekdays: 'border-b border-border',
              weekday:
                'h-9 w-9 text-center text-[10px] font-extrabold tracking-[0.04em] text-muted uppercase',
              week: 'mt-1',
              day: 'size-9 p-0 text-center text-[13px]',
              day_button:
                'grid size-9 cursor-pointer place-items-center rounded-lg border-0 bg-transparent font-semibold text-strong outline-none hover:bg-accent-soft hover:text-accent focus-visible:shadow-[0_0_0_3px_var(--color-accent-soft)]',
              selected:
                '[&>button]:!bg-accent [&>button]:!font-bold [&>button]:!text-white',
              today: '[&>button]:font-extrabold [&>button]:text-accent',
              outside: 'opacity-35',
              disabled: 'cursor-not-allowed opacity-30',
            }}
            defaultMonth={selectedDate}
            locale={locale === 'pl-PL' ? pl : enGB}
            mode="single"
            required={required}
            selected={selectedDate}
            onSelect={selectDate}
          />
          {selectedDate && !required && (
            <div className="border-t border-border px-3 py-2">
              <Button
                className="h-auto p-0 text-xs"
                variant="link"
                type="button"
                onClick={() => selectDate(undefined)}
              >
                {t('datePicker.clear')}
              </Button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

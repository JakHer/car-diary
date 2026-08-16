import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import type { ServiceCategory } from '@/types'
import { SelectField } from '@/components/forms/select-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type CategoryFilter = 'all' | ServiceCategory
export type RecordSort = 'newest' | 'oldest' | 'mileage' | 'cost'

interface ServiceHistoryFiltersProps {
  category: CategoryFilter
  query: string
  sort: RecordSort
  onCategoryChange: (category: CategoryFilter) => void
  onQueryChange: (query: string) => void
  onSortChange: (sort: RecordSort) => void
}

const categories: CategoryFilter[] = [
  'all',
  'Maintenance',
  'Repair',
  'Inspection',
  'Tires',
  'Other',
]

export const ServiceHistoryFilters = ({
  category,
  query,
  sort,
  onCategoryChange,
  onQueryChange,
  onSortChange,
}: ServiceHistoryFiltersProps) => {
  const { t } = useTranslation()
  const categoryOptions = categories.map((value) => ({
    label: t(`service.categories.${value}`),
    value,
  }))
  const sortOptions: Array<{ label: string; value: RecordSort }> = [
    { label: t('history.sortNewest'), value: 'newest' },
    { label: t('history.sortOldest'), value: 'oldest' },
    { label: t('history.sortMileage'), value: 'mileage' },
    { label: t('history.sortCost'), value: 'cost' },
  ]

  return (
    <div
      className="grid grid-cols-[minmax(180px,1fr)_auto_auto] gap-2.5 border-b border-border py-4 max-[700px]:grid-cols-2"
      aria-label={t('history.filtersAria')}
    >
      <div className="relative max-[700px]:col-span-2">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-light"
          strokeWidth={1.75}
        />
        <Input
          className="h-9 w-full rounded-[9px] border border-border-strong bg-surface pr-9 pl-9 text-[13px] font-medium text-strong outline-none transition-[border-color,box-shadow] placeholder:text-light focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] [&::-webkit-search-cancel-button]:hidden"
          type="search"
          aria-label={t('history.search')}
          placeholder={t('history.searchPlaceholder')}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && (
          <Button
            className="absolute top-1/2 right-2 -translate-y-1/2"
            size="icon-xs"
            variant="ghost"
            type="button"
            aria-label={t('history.clearSearch')}
            onClick={() => onQueryChange('')}
          >
            <X aria-hidden="true" className="size-3.5" strokeWidth={2} />
          </Button>
        )}
      </div>
      <SelectField
        ariaLabel={t('history.category')}
        options={categoryOptions}
        value={category}
        variant="toolbar"
        onValueChange={(value) => onCategoryChange(value as CategoryFilter)}
      />
      <SelectField
        ariaLabel={t('history.sort')}
        options={sortOptions}
        value={sort}
        variant="toolbar"
        onValueChange={(value) => onSortChange(value as RecordSort)}
      />
    </div>
  )
}

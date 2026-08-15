import type { ServiceRecord } from '../types'
import {
  cardStyles,
  dangerActionStyles,
  eyebrowStyles,
  joinClassNames,
  sectionHeadingStyles,
  sectionTitleStyles,
  smallActionStyles,
  tagStyles,
} from '../styles'

interface ServiceHistoryProps {
  records: ServiceRecord[]
  editingRecordId: string | null
  onDelete: (recordId: string) => void
  onEdit: (recordId: string) => void
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'PLN',
})

const formatDate = (date: string): string => {
  return dateFormatter.format(new Date(`${date}T12:00:00`))
}

export const ServiceHistory = ({
  records,
  editingRecordId,
  onDelete,
  onEdit,
}: ServiceHistoryProps) => {
  return (
    <section
      className={joinClassNames(cardStyles, 'p-7 max-[700px]:p-[22px]')}
    >
      <div
        className={joinClassNames(
          sectionHeadingStyles,
          'border-b border-border pb-[22px]',
        )}
      >
        <div>
          <p className={eyebrowStyles}>Timeline</p>
          <h2 className={sectionTitleStyles}>Service history</h2>
        </div>
        <span className={tagStyles}>
          {records.length} {records.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="grid min-h-[370px] place-content-center justify-items-center px-5 py-12 text-center">
          <span
            className="mb-5 grid size-12 place-items-center rounded-full bg-accent-soft text-2xl text-accent"
            aria-hidden="true"
          >
            +
          </span>
          <h3 className="m-0 text-lg text-strong">No service records yet</h3>
          <p className="mt-2 mb-0 max-w-[360px] text-sm leading-[1.6] text-muted">
            Add the first visit to start building your vehicle's history.
          </p>
        </div>
      ) : (
        <ol className="m-0 list-none pt-2 pl-0">
          {records.map((record) => (
            <li
              className={joinClassNames(
                'relative border-b border-border py-6 pr-0 pl-7 last:border-b-0',
                editingRecordId === record.id &&
                  'shadow-[inset_3px_0_var(--color-accent)]',
              )}
              key={record.id}
            >
              <div
                className="absolute top-[30px] left-0 size-2.5 rounded-full border-[3px] border-surface bg-accent shadow-[0_0_0_1px_var(--color-accent)]"
                aria-hidden="true"
              />
              <article>
                <div className="flex items-start justify-between gap-5 max-[700px]:flex-col">
                  <div>
                    <span
                      className={joinClassNames(
                        tagStyles,
                        'inline-block bg-accent-soft text-accent',
                      )}
                    >
                      {record.category}
                    </span>
                    <h3 className="mt-3 mb-0 text-lg text-strong">
                      {record.title}
                    </h3>
                  </div>
                  <div className="grid justify-items-end gap-3 max-[700px]:w-full max-[700px]:grid-cols-[1fr_auto] max-[700px]:items-center max-[700px]:justify-items-start">
                    <strong className="text-base text-strong">
                      {currencyFormatter.format(record.costInCents / 100)}
                    </strong>
                    <div className="flex gap-1.5">
                      <button
                        className={smallActionStyles}
                        type="button"
                        onClick={() => onEdit(record.id)}
                      >
                        Edit
                      </button>
                      <button
                        className={dangerActionStyles}
                        type="button"
                        onClick={() => onDelete(record.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-muted">
                  <span>{formatDate(record.date)}</span>
                  <span>{record.mileage.toLocaleString('en-GB')} km</span>
                  {record.workshop && <span>{record.workshop}</span>}
                </div>
                {record.notes && (
                  <p className="mt-3 mb-0 text-[13px] leading-[1.6] text-muted">
                    {record.notes}
                  </p>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

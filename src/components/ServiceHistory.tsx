import type { ServiceRecord } from '../types'

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
    <section className="card history-card">
      <div className="section-heading history-heading">
        <div>
          <p className="eyebrow">Timeline</p>
          <h2>Service history</h2>
        </div>
        <span className="record-count">
          {records.length} {records.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">+</span>
          <h3>No service records yet</h3>
          <p>Add the first visit to start building your vehicle's history.</p>
        </div>
      ) : (
        <ol className="timeline">
          {records.map((record) => (
            <li
              className={`timeline-item${editingRecordId === record.id ? ' timeline-item-active' : ''}`}
              key={record.id}
            >
              <div className="timeline-marker" aria-hidden="true" />
              <article>
                <div className="record-header">
                  <div>
                    <span className="category">{record.category}</span>
                    <h3>{record.title}</h3>
                  </div>
                  <div className="record-side">
                    <strong>
                      {currencyFormatter.format(record.costInCents / 100)}
                    </strong>
                    <div className="record-actions">
                      <button type="button" onClick={() => onEdit(record.id)}>
                        Edit
                      </button>
                      <button
                        className="button-danger"
                        type="button"
                        onClick={() => onDelete(record.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="record-meta">
                  <span>{formatDate(record.date)}</span>
                  <span>{record.mileage.toLocaleString('en-GB')} km</span>
                  {record.workshop && <span>{record.workshop}</span>}
                </div>
                {record.notes && <p className="record-notes">{record.notes}</p>}
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

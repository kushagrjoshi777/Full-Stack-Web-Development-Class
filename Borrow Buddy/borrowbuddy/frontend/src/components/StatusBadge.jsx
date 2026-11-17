const STYLES = {
  AVAILABLE: 'bg-forest-50 text-forest-700',
  UNAVAILABLE: 'bg-sand-100 text-ink-500',
  BORROWED: 'bg-amber-soft text-amber-deep',
  PENDING: 'bg-amber-soft text-amber-deep',
  APPROVED: 'bg-forest-50 text-forest-700',
  ACTIVE: 'bg-sky-50 text-sky-800',
  RETURNED: 'bg-sand-100 text-ink-700',
  REJECTED: 'bg-red-50 text-red-700',
  CANCELLED: 'bg-sand-100 text-ink-500',
  ADMIN: 'bg-forest-700 text-white',
  USER: 'bg-sand-100 text-ink-700',
}
const LABELS = { ACTIVE: 'Active (borrowed)' }

export default function StatusBadge({ status, className = '' }) {
  const label = LABELS[status] || status.charAt(0) + status.slice(1).toLowerCase()
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-sans ${STYLES[status] || STYLES.USER} ${className}`}>
      {label}
    </span>
  )
}

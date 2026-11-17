import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Check, PackageCheck, Undo2, X } from 'lucide-react'
import SafeImage from './SafeImage'
import StatusBadge from './StatusBadge'
import { fmtShort, money } from '../utils/format'

/**
 * One borrow request. `perspective` = 'owner' | 'borrower' | 'admin' decides which actions are offered.
 * `act(id, action)` calls the backend; the backend re-validates everything.
 */
export default function RequestRow({ r, perspective, act, busyId }) {
  const busy = busyId === r.id
  const btn = (action, label, cls, Icon) => (
    <button key={action} id={`req-${r.id}-${action}`} disabled={busy} onClick={() => act(r.id, action)} className={`btn btn-sm ${cls}`}>
      <Icon size={14} /> {label}
    </button>
  )

  const actions = []
  if (perspective === 'owner') {
    if (r.status === 'PENDING') actions.push(btn('approve', 'Approve', 'btn-primary', Check), btn('reject', 'Reject', 'btn-danger', X))
    if (r.status === 'APPROVED') actions.push(btn('handover', 'Mark handed over', 'btn-primary', PackageCheck), btn('cancel', 'Cancel', 'btn-danger', X))
    if (r.status === 'ACTIVE') actions.push(btn('return', 'Mark returned', 'btn-primary', Undo2))
  }
  if (perspective === 'borrower' && r.status === 'PENDING') actions.push(btn('cancel', 'Cancel request', 'btn-danger', X))
  if (perspective === 'admin' && ['PENDING', 'APPROVED', 'ACTIVE'].includes(r.status)) actions.push(btn('admin-cancel', 'Force cancel', 'btn-danger', X))

  const counterpart = perspective === 'owner' ? `Requested by ${r.borrowerName}`
    : perspective === 'borrower' ? `From ${r.ownerName}`
      : `${r.borrowerName} ← ${r.ownerName}`

  return (
    <article className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center" data-status={r.status}>
      <Link to={`/items/${r.itemId}`} className="h-20 w-full shrink-0 overflow-hidden rounded-xl bg-sand-100 sm:h-[72px] sm:w-24">
        <SafeImage src={r.itemImageUrl} alt={r.itemTitle} className="h-full w-full" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/items/${r.itemId}`} className="truncate font-sans font-medium hover:text-forest-700">{r.itemTitle}</Link>
          <StatusBadge status={r.status} />
        </div>
        <p className="mt-0.5 text-sm text-ink-500">{counterpart}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-700">
          <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-ink-400" /> {fmtShort(r.startDate)} <ArrowRight size={12} /> {fmtShort(r.endDate)} · {r.days}d</span>
          <span className="font-medium">{r.totalPrice > 0 ? money(r.totalPrice) : 'Free'}</span>
        </p>
        {r.message && <p className="mt-2 line-clamp-2 rounded-lg bg-sand-50 px-3 py-1.5 text-[13px] italic text-ink-500">“{r.message}”</p>}
      </div>
      {actions.length > 0 && <div className="flex flex-wrap gap-2 sm:max-w-[200px] sm:justify-end">{actions}</div>}
    </article>
  )
}

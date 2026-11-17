import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpenCheck, History, Inbox, Package, Pencil, Plus, Send } from 'lucide-react'
import api, { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import RequestRow from '../components/RequestRow'
import SafeImage from '../components/SafeImage'
import StatusBadge from '../components/StatusBadge'
import { EmptyState, PageLoader } from '../components/UI'
import { priceLabel } from '../utils/format'

const TABS = [
  { key: 'listings', label: 'My listings' },
  { key: 'incoming', label: 'Incoming requests' },
  { key: 'outgoing', label: 'Outgoing requests' },
  { key: 'borrowed', label: 'Currently borrowed' },
  { key: 'history', label: 'History' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'listings'
  const [data, setData] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    try {
      const [stats, listings, incoming, outgoing] = await Promise.all([
        api.get('/dashboard/stats'), api.get('/my/items'), api.get('/requests/incoming'), api.get('/requests/outgoing'),
      ])
      setData({ stats: stats.data, listings: listings.data, incoming: incoming.data, outgoing: outgoing.data })
    } catch (e) { toast.error(errorMessage(e)) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const act = async (id, action) => {
    setBusyId(id)
    try {
      await api.patch(`/requests/${id}/${action}`)
      const msgs = { approve: 'Request approved', reject: 'Request rejected', handover: 'Marked as handed over', return: 'Marked as returned', cancel: 'Request cancelled' }
      toast.success(msgs[action] || 'Done')
      await load()
    } catch (e) { toast.error(errorMessage(e)); await load() }
    finally { setBusyId(null) }
  }

  if (!data) return <PageLoader />
  const { stats, listings, incoming, outgoing } = data

  const borrowed = outgoing.filter((r) => ['ACTIVE', 'APPROVED'].includes(r.status))
  const history = [
    ...incoming.filter((r) => ['RETURNED', 'REJECTED', 'CANCELLED'].includes(r.status)).map((r) => ({ r, p: 'owner' })),
    ...outgoing.filter((r) => ['RETURNED', 'REJECTED', 'CANCELLED'].includes(r.status)).map((r) => ({ r, p: 'borrower' })),
  ].sort((a, b) => new Date(b.r.updatedAt) - new Date(a.r.updatedAt))

  const counts = {
    listings: listings.length,
    incoming: incoming.filter((r) => ['PENDING', 'APPROVED', 'ACTIVE'].includes(r.status)).length,
    outgoing: outgoing.filter((r) => ['PENDING'].includes(r.status)).length,
    borrowed: borrowed.length,
    history: history.length,
  }

  const summary = [
    ['Listings', stats.listings, `${stats.availableListings} available`],
    ['Waiting for you', stats.incomingPending, 'pending requests'],
    ['Borrowed now', stats.currentlyBorrowed, 'items with you'],
    ['Lent out now', stats.currentlyLent, 'items with neighbours'],
    ['Completed', stats.completedBorrows + stats.completedLends, `${stats.completedBorrows} borrowed · ${stats.completedLends} lent`],
  ]

  return (
    <div className="container-bb py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Dashboard</p>
          <h1 className="mt-1 text-2xl font-medium sm:text-[28px]">Hello, {user.name.split(' ')[0]}</h1>
        </div>
        <Link to="/items/new" className="btn btn-primary"><Plus size={16} /> List an item</Link>
      </div>

      <dl className="surface mb-8 grid grid-cols-2 divide-line sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
        {summary.map(([label, value, sub]) => (
          <div key={label} className="p-4 sm:p-5">
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
            <dd className="mt-1 font-sans text-2xl font-bold text-forest-700">{value}</dd>
            <p className="text-xs text-ink-500">{sub}</p>
          </div>
        ))}
      </dl>

      <div className="mb-6 flex gap-6 overflow-x-auto border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" id={`tab-${t.key}`} aria-selected={tab === t.key} onClick={() => setParams({ tab: t.key }, { replace: true })}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}>
            {t.label}<span className="ml-1.5 rounded-full bg-sand-100 px-1.5 py-0.5 text-[11px] text-ink-500">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {tab === 'listings' && (listings.length === 0 ? (
          <EmptyState icon={Package} title="You haven't listed anything yet" text="That ladder in your store room could help a neighbour this weekend."
            action={<Link to="/items/new" className="btn btn-primary">List your first item</Link>} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {listings.map((i) => (
              <div key={i.id} className="surface flex items-center gap-4 p-3">
                <Link to={`/items/${i.id}`} className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-sand-100"><SafeImage src={i.imageUrl} alt={i.title} icon={i.categoryIcon} className="h-full w-full" /></Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/items/${i.id}`} className="block truncate font-sans font-medium hover:text-forest-700">{i.title}</Link>
                  <p className="text-sm text-ink-500">{i.categoryName} · {priceLabel(i)}</p>
                  <div className="mt-1.5"><StatusBadge status={i.status} /></div>
                </div>
                <Link to={`/items/${i.id}/edit`} className="btn btn-outline btn-sm" aria-label={`Edit ${i.title}`}><Pencil size={14} /> Edit</Link>
              </div>
            ))}
          </div>
        ))}

        {tab === 'incoming' && (incoming.length === 0
          ? <EmptyState icon={Inbox} title="No requests yet" text="When a neighbour asks to borrow one of your items, it shows up here." />
          : incoming.map((r) => <RequestRow key={r.id} r={r} perspective="owner" act={act} busyId={busyId} />))}

        {tab === 'outgoing' && (outgoing.length === 0
          ? <EmptyState icon={Send} title="You haven't requested anything" text="Find something useful nearby." action={<Link to="/browse" className="btn btn-primary">Browse items</Link>} />
          : outgoing.map((r) => <RequestRow key={r.id} r={r} perspective="borrower" act={act} busyId={busyId} />))}

        {tab === 'borrowed' && (borrowed.length === 0
          ? <EmptyState icon={BookOpenCheck} title="Nothing borrowed right now" text="Approved and active borrowings will appear here." />
          : borrowed.map((r) => <RequestRow key={r.id} r={r} perspective="borrower" act={act} busyId={busyId} />))}

        {tab === 'history' && (history.length === 0
          ? <EmptyState icon={History} title="No history yet" text="Returned, rejected and cancelled requests are kept here." />
          : history.map(({ r, p }) => <RequestRow key={`${p}-${r.id}`} r={r} perspective={p} act={act} busyId={busyId} />))}
      </div>
    </div>
  )
}

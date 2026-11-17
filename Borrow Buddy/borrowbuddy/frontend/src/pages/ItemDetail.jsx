import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CalendarX2, Loader2, MapPin, Pencil, ShieldCheck, Sparkles } from 'lucide-react'
import api, { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import SafeImage from '../components/SafeImage'
import StatusBadge from '../components/StatusBadge'
import { ErrorBanner, PageLoader } from '../components/UI'
import { conditionLabel, fmtDate, fmtShort, initials, money, priceLabel, todayISO } from '../utils/format'

export default function ItemDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [bookings, setBookings] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState({ startDate: todayISO(), endDate: todayISO(), message: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => {
    api.get(`/items/${id}`).then((r) => setItem(r.data)).catch(() => setNotFound(true))
    api.get(`/items/${id}/bookings`).then((r) => setBookings(r.data)).catch(() => {})
  }
  useEffect(load, [id])

  const days = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0
    const d = Math.round((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1
    return d > 0 ? d : 0
  }, [form])

  if (notFound) return (
    <div className="container-bb py-24 text-center">
      <h1 className="text-2xl font-medium">This item is no longer available</h1>
      <Link to="/browse" className="btn btn-primary mt-6">Back to browse</Link>
    </div>
  )
  if (!item) return <PageLoader />

  const isOwner = user && user.id === item.ownerId
  const total = item.free ? 0 : Number(item.dailyPrice) * days
  const canRequest = item.status !== 'UNAVAILABLE'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (days < 1) return setError('Return date must be on or after the start date')
    setBusy(true)
    try {
      await api.post('/requests', { itemId: item.id, ...form })
      toast.success('Request sent! The owner will review it soon.')
      navigate('/dashboard?tab=outgoing')
    } catch (err) {
      setError(errorMessage(err))
    } finally { setBusy(false) }
  }

  return (
    <div className="container-bb py-8">
      <Link to="/browse" className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-forest-700"><ArrowLeft size={16} /> Back to browse</Link>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-[1.5rem] border border-line bg-sand-100 shadow-card">
            <SafeImage src={item.imageUrl} alt={item.title} icon={item.categoryIcon} className="aspect-[4/3] w-full" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">{item.categoryName}</span>
            <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">{conditionLabel(item.condition)}</span>
          </div>
          <h1 className="mt-3 text-[28px] font-medium leading-tight">{item.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-ink-500"><MapPin size={16} /> {item.location}</p>

          <h2 className="mt-8 text-base font-medium">About this item</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-700">{item.description}</p>

          <div className="surface mt-8 flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest-100 font-sans font-semibold text-forest-700">{initials(item.ownerName)}</span>
            <div>
              <p className="text-xs text-ink-500">Lent by</p>
              <p className="font-medium">{item.ownerName}</p>
              <p className="text-sm text-ink-500">{item.ownerLocation || 'Chennai'} · Member since {fmtDate(item.ownerSince)}</p>
            </div>
          </div>
        </div>

        <aside>
          <div className="surface p-6 lg:sticky lg:top-24">
            <div className="flex items-baseline justify-between">
              <p className="font-sans text-3xl font-bold text-forest-700">{priceLabel(item)}</p>
              {item.free && <span className="flex items-center gap-1 text-xs font-medium text-forest-600"><Sparkles size={14} /> Free to borrow</span>}
            </div>

            {isOwner ? (
              <div className="mt-5 space-y-3">
                <p className="rounded-xl bg-sand-50 p-3 text-sm text-ink-700">This is your listing. Owners cannot borrow their own items.</p>
                <Link to={`/items/${item.id}/edit`} className="btn btn-outline w-full"><Pencil size={16} /> Edit listing</Link>
                <Link to="/dashboard?tab=incoming" className="btn btn-tonal w-full">View requests</Link>
              </div>
            ) : !canRequest ? (
              <p className="mt-5 rounded-xl bg-sand-50 p-4 text-sm text-ink-700">The owner has paused this listing. Check back soon.</p>
            ) : !user ? (
              <div className="mt-5 space-y-3">
                <p className="text-sm text-ink-500">Sign in to request this item from {item.ownerName.split(' ')[0]}.</p>
                <Link to="/login" state={{ from: `/items/${item.id}` }} id="detail-login" className="btn btn-primary w-full">Sign in to borrow</Link>
                <Link to="/register" className="btn btn-outline w-full">Create account</Link>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-4">
                <ErrorBanner message={error} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startDate" className="label">Pick-up</label>
                    <input id="startDate" type="date" required min={todayISO()} className="field" value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: e.target.value > form.endDate ? e.target.value : form.endDate })} />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="label">Return</label>
                    <input id="endDate" type="date" required min={form.startDate} className="field" value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="label">Message to owner <span className="font-normal text-ink-400">(optional)</span></label>
                  <textarea id="message" rows={3} maxLength={500} className="field resize-none" placeholder="What will you use it for?"
                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-sand-50 px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 text-ink-700"><CalendarDays size={16} /> {days || 0} {days === 1 ? 'day' : 'days'}</span>
                  <span className="font-medium">{item.free ? 'Free' : money(total)}</span>
                </div>
                <button id="request-submit" disabled={busy} className="btn btn-primary w-full">{busy && <Loader2 size={16} className="animate-spin" />} Request to borrow</button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-ink-500"><ShieldCheck size={14} /> You won't be charged online. Settle rent in person.</p>
              </form>
            )}

            <div className="mt-6 border-t border-line pt-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium"><CalendarX2 size={16} className="text-ink-500" /> Already booked</p>
              {bookings.length === 0 ? <p className="text-sm text-ink-500">No upcoming bookings. Any dates are open.</p> : (
                <ul className="space-y-2">
                  {bookings.map((b, idx) => (
                    <li key={idx} className="flex items-center justify-between rounded-lg bg-sand-50 px-3 py-2 text-sm">
                      <span>{fmtShort(b.startDate)} → {fmtShort(b.endDate)}</span><StatusBadge status={b.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ban, CheckCircle2, Eye, EyeOff, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import api, { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import RequestRow from '../components/RequestRow'
import SafeImage from '../components/SafeImage'
import StatusBadge from '../components/StatusBadge'
import { Modal, PageHeader, PageLoader } from '../components/UI'
import { fmtDate, initials, priceLabel } from '../utils/format'

const TABS = [['users', 'Users'], ['items', 'Listings'], ['requests', 'Platform activity']]

export default function Admin() {
  const { user: me } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('users')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [items, setItems] = useState([])
  const [reqs, setReqs] = useState([])
  const [reqFilter, setReqFilter] = useState('ALL')
  const [busyId, setBusyId] = useState(null)
  const [del, setDel] = useState(null)

  const load = useCallback(async () => {
    try {
      const [s, u, i, r] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users'), api.get('/admin/items'), api.get('/admin/requests')])
      setStats(s.data); setUsers(u.data); setItems(i.data); setReqs(r.data)
    } catch (e) { toast.error(errorMessage(e)) }
  }, [toast])
  useEffect(() => { load() }, [load])

  const run = async (fn, ok) => {
    try { await fn(); toast.success(ok); await load() } catch (e) { toast.error(errorMessage(e)) }
  }

  if (!stats) return <PageLoader />

  const tiles = [
    ['Users', stats.users], ['Items', stats.items], ['Total requests', stats.requests],
    ['Active borrowings', stats.activeBorrowings], ['Pending', stats.pendingRequests], ['Completed', stats.completedRequests],
  ]
  const shownReqs = reqFilter === 'ALL' ? reqs : reqs.filter((r) => r.status === reqFilter)

  return (
    <div className="container-bb py-8">
      <PageHeader title="Admin console" subtitle="Platform health and moderation." />

      <dl className="surface mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x lg:divide-line">
        {tiles.map(([l, v]) => (
          <div key={l} className="p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{l}</dt>
            <dd className="mt-1 font-sans text-2xl font-bold text-forest-700" data-testid={`admin-stat-${l}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mb-6 flex gap-6 border-b border-line" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" id={`admin-tab-${k}`} aria-selected={tab === k} className={`tab ${tab === k ? 'tab-active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-sand-50 text-xs uppercase tracking-wide text-ink-500">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-xs font-semibold text-forest-700">{initials(u.name)}</span>
                      <div><p className="font-medium">{u.name}</p><p className="text-xs text-ink-500">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                  <td className="px-4 py-3 text-ink-500">{fmtDate(u.createdAt?.slice(0, 10))}</td>
                  <td className="px-4 py-3">{u.enabled ? <span className="inline-flex items-center gap-1 text-forest-700"><CheckCircle2 size={14} /> Active</span> : <span className="inline-flex items-center gap-1 text-red-700"><Ban size={14} /> Suspended</span>}</td>
                  <td className="px-4 py-3">
                    {u.id === me.id ? <p className="text-right text-xs text-ink-400">You</p> : (
                      <div className="flex justify-end gap-2">
                        <button id={`user-${u.id}-toggle`} className="btn btn-outline btn-sm"
                          onClick={() => run(() => api.patch(`/admin/users/${u.id}/enabled`, { enabled: !u.enabled }), u.enabled ? 'User suspended' : 'User reinstated')}>
                          {u.enabled ? <><Ban size={14} /> Suspend</> : <><CheckCircle2 size={14} /> Reinstate</>}
                        </button>
                        <button id={`user-${u.id}-role`} className="btn btn-outline btn-sm"
                          onClick={() => run(() => api.patch(`/admin/users/${u.id}/role`, { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' }), 'Role updated')}>
                          {u.role === 'ADMIN' ? <><ShieldOff size={14} /> Make user</> : <><ShieldCheck size={14} /> Make admin</>}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'items' && (
        <div className="surface overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line bg-sand-50 text-xs uppercase tracking-wide text-ink-500">
              <tr><th className="px-4 py-3">Listing</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3">
                    <Link to={`/items/${i.id}`} className="flex items-center gap-3 hover:text-forest-700">
                      <span className="h-10 w-14 overflow-hidden rounded-lg bg-sand-100"><SafeImage src={i.imageUrl} alt="" icon={i.categoryIcon} className="h-full w-full" /></span>
                      <span><span className="block max-w-[260px] truncate font-medium">{i.title}</span><span className="text-xs text-ink-500">{i.categoryName}</span></span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{i.ownerName}</td>
                  <td className="px-4 py-3 text-ink-700">{priceLabel(i)}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {i.status !== 'BORROWED' && (
                        <button id={`item-${i.id}-toggle`} className="btn btn-outline btn-sm"
                          onClick={() => run(() => api.patch(`/admin/items/${i.id}/status`, { status: i.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE' }), i.status === 'AVAILABLE' ? 'Listing hidden' : 'Listing restored')}>
                          {i.status === 'AVAILABLE' ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Restore</>}
                        </button>
                      )}
                      <button id={`item-${i.id}-delete`} className="btn btn-danger btn-sm" onClick={() => setDel(i)}><Trash2 size={14} /> Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'requests' && (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'RETURNED', 'REJECTED', 'CANCELLED'].map((s) => (
              <button key={s} className={`chip ${reqFilter === s ? 'chip-active' : ''}`} onClick={() => setReqFilter(s)}>{s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}</button>
            ))}
          </div>
          <div className="space-y-3">
            {shownReqs.map((r) => (
              <RequestRow key={r.id} r={r} perspective="admin" busyId={busyId}
                act={async (id) => { setBusyId(id); await run(() => api.patch(`/admin/requests/${id}/cancel`), 'Request cancelled by admin'); setBusyId(null) }} />
            ))}
            {shownReqs.length === 0 && <p className="py-10 text-center text-sm text-ink-500">No requests with this status.</p>}
          </div>
        </div>
      )}

      <Modal open={!!del} onClose={() => setDel(null)} title="Remove this listing?"
        footer={<><button className="btn btn-outline" onClick={() => setDel(null)}>Cancel</button>
          <button id="admin-confirm-delete" className="btn btn-danger-solid" onClick={async () => { const i = del; setDel(null); await run(() => api.delete(`/admin/items/${i.id}`), 'Listing removed') }}>Remove</button></>}>
        <p className="text-sm text-ink-500">“{del?.title}” and all of its requests will be permanently deleted.</p>
      </Modal>
    </div>
  )
}

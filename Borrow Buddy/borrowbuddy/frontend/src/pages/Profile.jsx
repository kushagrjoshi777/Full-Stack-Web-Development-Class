import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import api, { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ErrorBanner, PageHeader } from '../components/UI'
import StatusBadge from '../components/StatusBadge'
import { fmtDate } from '../utils/format'

export default function Profile() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', location: user.location || '', bio: user.bio || '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true)
    try { const { data } = await api.put('/users/me', form); setUser(data); toast.success('Profile saved') }
    catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }

  return (
    <div className="container-bb max-w-2xl py-8">
      <PageHeader title="Your profile" subtitle="Neighbours see your name and area on your listings." />
      <form onSubmit={submit} className="surface space-y-5 p-6">
        <ErrorBanner message={error} />
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-sand-50 px-4 py-3 text-sm">
          <span className="text-ink-500">{user.email}</span><StatusBadge status={user.role} />
          <span className="text-ink-500">· Member since {fmtDate(user.createdAt?.slice(0, 10))}</span>
        </div>
        <div><label htmlFor="name" className="label">Full name</label><input id="name" required maxLength={100} className="field" value={form.name} onChange={set('name')} /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="phone" className="label">Phone</label><input id="phone" maxLength={20} className="field" value={form.phone} onChange={set('phone')} /></div>
          <div><label htmlFor="location" className="label">Area</label><input id="location" maxLength={120} className="field" value={form.location} onChange={set('location')} /></div>
        </div>
        <div><label htmlFor="bio" className="label">About you</label><textarea id="bio" rows={4} maxLength={500} className="field" value={form.bio} onChange={set('bio')} /></div>
        <div className="flex justify-end"><button id="profile-save" disabled={busy} className="btn btn-primary">{busy && <Loader2 size={16} className="animate-spin" />} Save changes</button></div>
      </form>
    </div>
  )
}

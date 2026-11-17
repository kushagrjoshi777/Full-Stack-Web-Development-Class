import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react'
import api, { errorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import SafeImage from '../components/SafeImage'
import { ErrorBanner, Modal, PageHeader, PageLoader } from '../components/UI'
import { CONDITIONS } from '../utils/format'

const EMPTY = { title: '', description: '', categoryId: '', condition: 'GOOD', location: '', dailyPrice: '', imageUrl: '', status: 'AVAILABLE' }

export default function ItemForm() {
  const { id } = useParams()
  const editing = !!id
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const fileRef = useRef(null)
  const [form, setForm] = useState({ ...EMPTY, location: user?.location || '' })
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(editing)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [borrowed, setBorrowed] = useState(false)

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data))
  }, [])

  useEffect(() => {
    if (!editing) return
    api.get(`/items/${id}`).then((r) => {
      const i = r.data
      if (i.ownerId !== user.id) { toast.error('You can only edit your own listings'); return navigate('/dashboard') }
      setBorrowed(i.status === 'BORROWED')
      setIsPaid(!i.free)
      setForm({ title: i.title, description: i.description, categoryId: String(i.categoryId), condition: i.condition,
        location: i.location, dailyPrice: i.free ? '' : String(i.dailyPrice), imageUrl: i.imageUrl || '', status: i.status })
    }).catch(() => { toast.error('Listing not found'); navigate('/dashboard') }).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const upload = async (file) => {
    if (!file) return
    setUploading(true); setError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const { data } = await api.post('/uploads', fd)
      setForm((f) => ({ ...f, imageUrl: data.url }))
    } catch (err) { setError(errorMessage(err, 'Image upload failed')) }
    finally { setUploading(false) }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (isPaid && !(Number(form.dailyPrice) > 0)) return setError('Enter a daily price greater than 0, or choose "Free to borrow"')
    setBusy(true)
    const payload = { ...form, categoryId: Number(form.categoryId), dailyPrice: isPaid ? Number(form.dailyPrice) : 0 }
    try {
      const { data } = editing ? await api.put(`/items/${id}`, payload) : await api.post('/items', payload)
      toast.success(editing ? 'Listing updated' : 'Your item is now listed!')
      navigate(`/items/${data.id}`)
    } catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }

  const remove = async () => {
    try { await api.delete(`/items/${id}`); toast.success('Listing deleted'); navigate('/dashboard') }
    catch (err) { toast.error(errorMessage(err)); setConfirmDelete(false) }
  }

  if (loading) return <PageLoader />

  return (
    <div className="container-bb max-w-3xl py-8">
      <PageHeader title={editing ? 'Edit listing' : 'List an item'} subtitle="Great photos and honest details get requested more." />
      <form onSubmit={submit} className="space-y-6">
        <ErrorBanner message={error} />

        <section className="surface p-6">
          <h2 className="mb-4 text-base font-medium">Photo</h2>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="h-40 w-full overflow-hidden rounded-2xl border border-line bg-sand-100 sm:w-56">
              {form.imageUrl
                ? <SafeImage src={form.imageUrl} alt="Item preview" className="h-full w-full" />
                : <div className="flex h-full flex-col items-center justify-center gap-1 text-ink-400"><ImagePlus size={28} strokeWidth={1.5} /><span className="text-xs">No photo yet</span></div>}
            </div>
            <div>
              <input ref={fileRef} id="image-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => upload(e.target.files?.[0])} />
              <button type="button" className="btn btn-outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} {form.imageUrl ? 'Replace photo' : 'Upload photo'}
              </button>
              {form.imageUrl && <button type="button" className="btn btn-ghost ml-2" onClick={() => setForm({ ...form, imageUrl: '' })}>Remove</button>}
              <p className="hint">JPEG, PNG, WebP or GIF, up to 5 MB. Stored on the BorrowBuddy server.</p>
            </div>
          </div>
        </section>

        <section className="surface space-y-5 p-6">
          <h2 className="text-base font-medium">Details</h2>
          <div>
            <label htmlFor="title" className="label">Title</label>
            <input id="title" required maxLength={150} className="field" value={form.title} onChange={set('title')} placeholder="e.g. Bosch cordless drill" />
          </div>
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" required rows={5} maxLength={4000} className="field" value={form.description} onChange={set('description')}
              placeholder="What's included, how it works best, any rules for borrowers." />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select id="category" required className="field" value={form.categoryId} onChange={set('categoryId')}>
                <option value="" disabled>Select a category</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="condition" className="label">Condition</label>
              <select id="condition" className="field" value={form.condition} onChange={set('condition')}>
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="location" className="label">Pick-up location</label>
            <input id="location" required maxLength={120} className="field" value={form.location} onChange={set('location')} placeholder="e.g. Velachery, Chennai" />
          </div>
        </section>

        <section className="surface space-y-5 p-6">
          <h2 className="text-base font-medium">Price & availability</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[{ v: false, t: 'Free to borrow', d: 'The community default' }, { v: true, t: 'Charge daily rent', d: 'Small amount per day' }].map((o) => (
              <button type="button" key={o.t} onClick={() => setIsPaid(o.v)} aria-pressed={isPaid === o.v}
                className={`rounded-2xl border p-4 text-left transition ${isPaid === o.v ? 'border-forest-600 bg-forest-50 ring-1 ring-forest-600' : 'border-line bg-white hover:bg-sand-50'}`}>
                <p className="font-sans font-medium">{o.t}</p><p className="text-xs text-ink-500">{o.d}</p>
              </button>
            ))}
          </div>
          {isPaid && (
            <div className="max-w-xs">
              <label htmlFor="dailyPrice" className="label">Price per day (₹)</label>
              <input id="dailyPrice" type="number" min="1" max="100000" step="1" required className="field" value={form.dailyPrice} onChange={set('dailyPrice')} />
            </div>
          )}
          <div className="max-w-xs">
            <label htmlFor="status" className="label">Listing status</label>
            <select id="status" className="field" value={form.status} onChange={set('status')} disabled={borrowed}>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable (paused)</option>
              {borrowed && <option value="BORROWED">Borrowed (currently out)</option>}
            </select>
            {borrowed && <p className="hint">Status changes automatically when you mark the item as returned.</p>}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {editing && <button type="button" id="delete-item" className="btn btn-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={16} /> Delete listing</button>}
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard" className="btn btn-outline">Cancel</Link>
            <button id="item-submit" disabled={busy || uploading} className="btn btn-primary">{busy && <Loader2 size={16} className="animate-spin" />} {editing ? 'Save changes' : 'Publish listing'}</button>
          </div>
        </div>
      </form>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this listing?"
        footer={<><button className="btn btn-outline" onClick={() => setConfirmDelete(false)}>Keep it</button><button id="confirm-delete" className="btn btn-danger-solid" onClick={remove}>Delete</button></>}>
        <p className="text-sm text-ink-500">This permanently removes the listing and its request history. This cannot be undone.</p>
      </Modal>
    </div>
  )
}

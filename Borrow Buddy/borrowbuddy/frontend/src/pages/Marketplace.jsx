import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageOpen, Search, SlidersHorizontal, X } from 'lucide-react'
import api from '../api/client'
import ItemCard, { ItemCardSkeleton } from '../components/ItemCard'
import { EmptyState } from '../components/UI'

const PRICE = [{ v: 'ALL', l: 'Any price' }, { v: 'FREE', l: 'Free' }, { v: 'PAID', l: 'Paid rent' }]

export default function Marketplace() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const categoryId = params.get('categoryId') || ''
  const location = params.get('location') || ''
  const priceType = params.get('priceType') || 'ALL'

  const [search, setSearch] = useState(q)
  const [items, setItems] = useState(null)
  const [cats, setCats] = useState([])
  const [locations, setLocations] = useState([])
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data)).catch(() => {})
    api.get('/items/locations').then((r) => setLocations(r.data)).catch(() => {})
  }, [])

  useEffect(() => { setSearch(q) }, [q])

  useEffect(() => {
    let cancelled = false
    setItems(null); setError('')
    api.get('/items', { params: { q: q || undefined, categoryId: categoryId || undefined, location: location || undefined, priceType } })
      .then((r) => !cancelled && setItems(r.data))
      .catch(() => { if (!cancelled) { setItems([]); setError('Could not load items. Please try again.') } })
    return () => { cancelled = true }
  }, [q, categoryId, location, priceType])

  const update = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([k, v]) => (v && v !== 'ALL' ? next.set(k, v) : next.delete(k)))
    setParams(next, { replace: true })
  }
  const clear = () => { setSearch(''); setParams({}, { replace: true }) }
  const activeFilters = [q, categoryId, location, priceType !== 'ALL' ? priceType : ''].filter(Boolean).length

  const filters = (
    <div className="space-y-7">
      <div>
        <p className="label">Category</p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          <button className={`chip lg:justify-start lg:rounded-xl lg:border-transparent ${!categoryId ? 'chip-active' : ''}`} onClick={() => update({ categoryId: '' })}>All categories</button>
          {cats.map((c) => (
            <button key={c.id} className={`chip lg:justify-between lg:rounded-xl lg:border-transparent ${String(categoryId) === String(c.id) ? 'chip-active' : ''}`} onClick={() => update({ categoryId: String(c.id) })}>
              <span>{c.name}</span><span className="text-xs text-ink-400">{c.itemCount}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="loc" className="label">Location</label>
        <select id="loc" className="field" value={location} onChange={(e) => update({ location: e.target.value })}>
          <option value="">Anywhere</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <p className="label">Price</p>
        <div className="flex flex-wrap gap-2">
          {PRICE.map((p) => (
            <button key={p.v} className={`chip ${priceType === p.v ? 'chip-active' : ''}`} onClick={() => update({ priceType: p.v })}>{p.l}</button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="container-bb py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-medium sm:text-[28px]">Browse items</h1>
        <p className="mt-1 text-ink-500">Everything your neighbours are happy to lend.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); update({ q: search.trim() }) }} role="search"
        className="mb-6 flex items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5 shadow-card focus-within:border-forest-400">
        <Search size={18} className="text-ink-400" />
        <input id="marketplace-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item name"
          aria-label="Search by item name" className="min-w-0 flex-1 bg-transparent py-2 focus:outline-none" />
        {search && <button type="button" onClick={() => { setSearch(''); update({ q: '' }) }} aria-label="Clear search" className="rounded-full p-1.5 text-ink-400 hover:bg-sand-100"><X size={16} /></button>}
        <button className="btn btn-primary btn-sm" type="submit">Search</button>
        <button type="button" className="btn btn-outline btn-sm lg:hidden" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
          <SlidersHorizontal size={15} /> Filters{activeFilters ? ` (${activeFilters})` : ''}
        </button>
      </form>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="surface p-5 lg:sticky lg:top-24">
            {filters}
            {activeFilters > 0 && <button onClick={clear} className="mt-6 text-sm font-medium text-forest-700 hover:underline">Clear all filters</button>}
          </div>
        </aside>

        <section aria-live="polite">
          {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {items && <p className="mb-4 text-sm text-ink-500">{items.length} {items.length === 1 ? 'item' : 'items'} found</p>}
          {items === null ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <ItemCardSkeleton key={i} />)}</div>
          ) : items.length === 0 ? (
            <EmptyState icon={PackageOpen} title="Nothing matches those filters"
              text="Try a different search term or clear your filters." action={<button className="btn btn-tonal" onClick={clear}>Clear filters</button>} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map((i) => <ItemCard key={i.id} item={i} />)}</div>
          )}
        </section>
      </div>
    </div>
  )
}

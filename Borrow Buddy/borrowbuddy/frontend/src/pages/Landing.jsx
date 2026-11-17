import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Handshake, HeartHandshake, PackageSearch, Search, Sparkles } from 'lucide-react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import ItemCard, { ItemCardSkeleton } from '../components/ItemCard'
import SafeImage from '../components/SafeImage'
import { CategoryIcon } from '../utils/format'

const STEPS = [
  { icon: PackageSearch, title: 'Find what you need', text: 'Search drills, cameras, tents and more from people living a few kilometres away.' },
  { icon: Handshake, title: 'Request and agree', text: 'Pick your dates and send a short note. The owner approves in a tap.' },
  { icon: HeartHandshake, title: 'Borrow and return', text: 'Pick it up, use it, hand it back. Most items are free; some ask a small daily rent.' },
]

export default function Landing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [featured, setFeatured] = useState(null)
  const [cats, setCats] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/items/featured').then((r) => setFeatured(r.data)).catch(() => setFeatured([]))
    api.get('/categories').then((r) => setCats(r.data)).catch(() => {})
    api.get('/stats/public').then((r) => setStats(r.data)).catch(() => {})
  }, [])

  const submit = (e) => { e.preventDefault(); navigate(`/browse${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`) }
  const collage = (featured || []).filter((i) => i.imageUrl).slice(0, 3)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-bb grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-20">
          <div className="rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1.5 text-[13px] font-medium text-forest-700">
              <Sparkles size={14} /> Now lending across Chennai
            </span>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.08] sm:text-[52px]">
              Why buy when<br />you can <span className="text-forest-600">borrow?</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-500">
              That drill gets used twice a year. That tent, once. BorrowBuddy connects you with neighbours who already own what you need, free by default.
            </p>
            <form onSubmit={submit} className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5 shadow-card transition-shadow focus-within:shadow-lift focus-within:border-forest-400" role="search">
              <Search size={18} className="shrink-0 text-ink-400" />
              <input id="hero-search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search items"
                placeholder="Try “drill”, “camera” or “tent”"
                className="min-w-0 flex-1 bg-transparent py-2 text-[15px] placeholder:text-ink-400 focus:outline-none" />
              <button type="submit" id="hero-search-btn" className="btn btn-primary">Search</button>
            </form>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {user ? (
                <Link to="/items/new" className="btn btn-tonal">List something you own <ArrowRight size={16} /></Link>
              ) : (
                <>
                  <Link to="/register" id="hero-register" className="btn btn-tonal">Create free account <ArrowRight size={16} /></Link>
                  <Link to="/login" id="hero-login" className="btn btn-ghost">I already have an account</Link>
                </>
              )}
            </div>
          </div>

          <div className="relative mx-auto grid w-full max-w-[520px] grid-cols-6 grid-rows-6 gap-3 sm:h-[480px]" aria-hidden="true">
            {collage.length === 3 ? (
              <>
                <div className="col-span-4 row-span-4 overflow-hidden rounded-[2rem] shadow-lift sm:rounded-[2.5rem]"><SafeImage src={collage[0].imageUrl} alt="" className="h-full min-h-[200px] w-full" /></div>
                <div className="col-span-2 col-start-5 row-span-3 mt-8 overflow-hidden rounded-[1.5rem] shadow-card"><SafeImage src={collage[1].imageUrl} alt="" className="h-full w-full" /></div>
                <div className="col-span-3 row-span-2 row-start-5 overflow-hidden rounded-[1.5rem] shadow-card"><SafeImage src={collage[2].imageUrl} alt="" className="h-full min-h-[110px] w-full" /></div>
                <div className="col-span-3 col-start-4 row-span-2 row-start-5 flex flex-col justify-center rounded-[1.5rem] bg-forest-700 p-5 text-white shadow-lift">
                  <p className="font-sans text-3xl font-bold">{stats ? stats.freeItems : '–'}</p>
                  <p className="text-sm text-forest-100">items free to borrow right now</p>
                </div>
              </>
            ) : (
              <div className="col-span-6 row-span-6 skeleton rounded-[2.5rem]" />
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-bb py-10">
        <div className="mb-6 flex items-end justify-between">
          <div><p className="kicker">Popular categories</p><h2 className="mt-1 text-2xl font-medium">Start with what you need</h2></div>
          <Link to="/browse" className="hidden text-sm font-medium text-forest-700 hover:underline sm:inline">All items →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cats.map((c) => (
            <Link key={c.id} to={`/browse?categoryId=${c.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-forest-300 hover:shadow-lift">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600 transition-colors group-hover:bg-forest-600 group-hover:text-white">
                <CategoryIcon name={c.icon} size={20} />
              </span>
              <span className="min-w-0"><span className="block truncate text-sm font-medium">{c.name}</span><span className="text-xs text-ink-500">{c.itemCount} items</span></span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-bb py-10">
        <div className="mb-6 flex items-end justify-between">
          <div><p className="kicker">Featured</p><h2 className="mt-1 text-2xl font-medium">Fresh from your neighbours</h2></div>
          <Link to="/browse" className="text-sm font-medium text-forest-700 hover:underline">Browse all →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured === null
            ? Array.from({ length: 4 }).map((_, i) => <ItemCardSkeleton key={i} />)
            : featured.slice(0, 8).map((i) => <ItemCard key={i.id} item={i} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="container-bb py-14">
        <div className="rounded-[2rem] border border-line bg-sand-50 p-8 sm:p-12">
          <p className="kicker">How BorrowBuddy works</p>
          <h2 className="mt-1 max-w-lg text-2xl font-medium">Three steps from “I need it once” to “thanks, neighbour”</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, idx) => (
              <li key={s.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-forest-600 shadow-card"><s.icon size={22} /></span>
                  <span className="font-sans text-sm font-semibold text-ink-400">0{idx + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Community stats + CTA */}
      <section className="container-bb pb-4">
        <div className="overflow-hidden rounded-[2rem] bg-forest-700 text-white">
          <div className="grid gap-px bg-white/10 sm:grid-cols-3">
            {[
              ['Neighbours', stats?.members], ['Items listed', stats?.items], ['Completed loans', stats?.completedBorrows],
            ].map(([label, val]) => (
              <div key={label} className="bg-forest-700 px-8 py-8">
                <p className="font-sans text-4xl font-bold">{val ?? '–'}</p>
                <p className="mt-1 text-sm text-forest-200">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start justify-between gap-5 bg-forest-800 px-8 py-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-medium text-white">Got things gathering dust?</h2>
              <p className="mt-1 text-sm text-forest-200">List an item in under two minutes and help a neighbour save money.</p>
            </div>
            <div className="flex gap-3">
              <Link to={user ? '/items/new' : '/register'} id="cta-primary" className="btn bg-white text-forest-800 hover:bg-forest-50">
                {user ? 'List an item' : 'Join BorrowBuddy'}
              </Link>
              {!user && <Link to="/login" id="cta-login" className="btn border border-white/30 text-white hover:bg-white/10">Sign in</Link>}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

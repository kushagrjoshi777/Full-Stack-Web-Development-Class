import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { LayoutDashboard, LogOut, Menu, Plus, ShieldCheck, UserCircle2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'

export const Logo = ({ light = false }) => (
  <span className="inline-flex items-center gap-2 font-sans text-[19px] font-bold tracking-tight">
    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-forest-600">
      <svg viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17l9-8 9 8M10 15v8h12v-8" />
      </svg>
    </span>
    <span className={light ? 'text-white' : 'text-ink-900'}>Borrow<span className={light ? 'text-forest-200' : 'text-forest-600'}>Buddy</span></span>
  </span>
)

const navCls = ({ isActive }) =>
  `rounded-full px-3.5 py-2 text-sm font-medium font-sans transition-colors ${isActive ? 'bg-forest-50 text-forest-700' : 'text-ink-700 hover:bg-sand-100'}`

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menu, setMenu] = useState(false)
  const [mobile, setMobile] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const doLogout = () => { logout(); setMenu(false); setMobile(false); navigate('/') }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="container-bb flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="BorrowBuddy home" onClick={() => setMobile(false)}><Logo /></Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <NavLink to="/browse" className={navCls}>Browse</NavLink>
          {user && <NavLink to="/dashboard" className={navCls}>Dashboard</NavLink>}
          {isAdmin && <NavLink to="/admin" className={navCls}>Admin</NavLink>}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link to="/items/new" id="nav-list-item" className="btn btn-primary btn-sm"><Plus size={16} /> List an item</Link>
              <div className="relative" ref={ref}>
                <button id="nav-user-menu" onClick={() => setMenu((m) => !m)} aria-label="Account menu" aria-expanded={menu}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-100 text-sm font-semibold text-forest-700 ring-2 ring-transparent transition hover:ring-forest-200">
                  {initials(user.name)}
                </button>
                {menu && (
                  <div className="rise absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-white shadow-pop">
                    <div className="border-b border-line px-4 py-3">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-ink-500">{user.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sand-50"><LayoutDashboard size={16} /> My dashboard</Link>
                    <Link to="/profile" onClick={() => setMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sand-50"><UserCircle2 size={16} /> Profile</Link>
                    {isAdmin && <Link to="/admin" onClick={() => setMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-sand-50"><ShieldCheck size={16} /> Admin console</Link>}
                    <button id="nav-logout" onClick={doLogout} className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left text-sm hover:bg-sand-50"><LogOut size={16} /> Sign out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" id="nav-login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" id="nav-register" className="btn btn-primary btn-sm">Join free</Link>
            </>
          )}
        </div>

        <button className="rounded-full p-2 hover:bg-sand-100 md:hidden" onClick={() => setMobile((m) => !m)} aria-label="Toggle menu" aria-expanded={mobile}>
          {mobile ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobile && (
        <div className="rise border-t border-line bg-canvas px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1" onClick={() => setMobile(false)}>
            <NavLink to="/browse" className={navCls}>Browse</NavLink>
            {user && <NavLink to="/dashboard" className={navCls}>Dashboard</NavLink>}
            {user && <NavLink to="/items/new" className={navCls}>List an item</NavLink>}
            {user && <NavLink to="/profile" className={navCls}>Profile</NavLink>}
            {isAdmin && <NavLink to="/admin" className={navCls}>Admin</NavLink>}
            {!user && <NavLink to="/login" className={navCls}>Sign in</NavLink>}
            {!user && <Link to="/register" className="btn btn-primary mt-2">Join free</Link>}
          </div>
          {user && <button onClick={doLogout} className="btn btn-outline mt-3 w-full"><LogOut size={16} /> Sign out</button>}
        </div>
      )}
    </header>
  )
}

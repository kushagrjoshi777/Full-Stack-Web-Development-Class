import { Link } from 'react-router-dom'
import { Logo } from './Navbar'

export default function Footer() {
  return (
    <footer className="mt-24 bg-forest-900 text-forest-100">
      <div className="container-bb grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-forest-200">
            A neighbourhood lending library for Chennai. Borrow what you need, lend what you rarely use, and keep good things in circulation.
          </p>
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-white">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-forest-200">
            <li><Link className="hover:text-white" to="/browse">Browse items</Link></li>
            <li><Link className="hover:text-white" to="/items/new">List an item</Link></li>
            <li><Link className="hover:text-white" to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-sans text-sm font-semibold text-white">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-forest-200">
            <li><Link className="hover:text-white" to="/login">Sign in</Link></li>
            <li><Link className="hover:text-white" to="/register">Create account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-forest-300">
        © {new Date().getFullYear()} BorrowBuddy · Made with care in Chennai
      </div>
    </footer>
  )
}

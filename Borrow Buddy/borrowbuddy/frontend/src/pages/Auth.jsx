import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../api/client'
import { ErrorBanner } from '../components/UI'
import { Logo } from '../components/Navbar'

function Shell({ title, subtitle, children, footer }) {
  return (
    <div className="container-bb flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="rise w-full max-w-[440px]">
        <div className="surface p-7 sm:p-9">
          <div className="mb-6"><Logo /></div>
          <h1 className="text-2xl font-medium">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-5 text-center text-sm text-ink-500">{footer}</p>
      </div>
    </div>
  )
}

export function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const dest = location.state?.from || '/dashboard'

  if (user) return <Navigate to={dest} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try { await login(form.email, form.password); navigate(dest, { replace: true }) }
    catch (err) { setError(errorMessage(err, 'Could not sign in.')) }
    finally { setBusy(false) }
  }

  return (
    <Shell title="Welcome back" subtitle="Sign in to manage your listings and requests."
      footer={<>New to BorrowBuddy? <Link to="/register" className="font-medium text-forest-700 hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <ErrorBanner message={error} />
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" required autoComplete="email" className="field" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" required autoComplete="current-password" className="field" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button id="login-submit" disabled={busy} className="btn btn-primary w-full">{busy && <Loader2 size={16} className="animate-spin" />} Sign in</button>
      </form>
      <div className="mt-6 rounded-xl bg-sand-50 p-3 text-xs text-ink-500">
        <p className="mb-1 font-medium text-ink-700">Demo accounts</p>
        <button type="button" className="block hover:text-forest-700" onClick={() => setForm({ email: 'demo@borrowbuddy.in', password: 'Password@123' })}>User: demo@borrowbuddy.in / Password@123</button>
        <button type="button" className="mt-0.5 block hover:text-forest-700" onClick={() => setForm({ email: 'admin@borrowbuddy.in', password: 'Admin@123' })}>Admin: admin@borrowbuddy.in / Admin@123</button>
      </div>
    </Shell>
  )
}

export function Register() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setBusy(true)
    try { await register(form); navigate('/dashboard', { replace: true }) }
    catch (err) { setError(errorMessage(err, 'Could not create your account.')) }
    finally { setBusy(false) }
  }

  return (
    <Shell title="Join your neighbourhood" subtitle="Create a free account to borrow and lend."
      footer={<>Already a member? <Link to="/login" className="font-medium text-forest-700 hover:underline">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBanner message={error} />
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" required maxLength={100} autoComplete="name" className="field" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" required autoComplete="email" className="field" value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" required minLength={6} autoComplete="new-password" className="field" value={form.password} onChange={set('password')} />
          <p className="hint">At least 6 characters.</p>
        </div>
        <div>
          <label htmlFor="location" className="label">Your area <span className="font-normal text-ink-400">(optional)</span></label>
          <input id="location" className="field" placeholder="e.g. Adyar, Chennai" value={form.location} onChange={set('location')} />
        </div>
        <button id="register-submit" disabled={busy} className="btn btn-primary w-full">{busy && <Loader2 size={16} className="animate-spin" />} Create account</button>
      </form>
    </Shell>
  )
}

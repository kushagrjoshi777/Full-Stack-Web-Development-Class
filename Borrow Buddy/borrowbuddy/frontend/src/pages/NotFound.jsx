import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-bb py-28 text-center">
      <p className="kicker">404</p>
      <h1 className="mt-2 text-3xl font-medium">We couldn't find that page</h1>
      <p className="mt-2 text-ink-500">It may have been moved, or maybe a neighbour borrowed it.</p>
      <Link to="/" className="btn btn-primary mt-7">Back to home</Link>
    </div>
  )
}

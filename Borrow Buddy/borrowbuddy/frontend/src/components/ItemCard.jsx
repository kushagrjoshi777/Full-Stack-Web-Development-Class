import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import SafeImage from './SafeImage'
import { initials, priceLabel, conditionLabel } from '../utils/format'

export default function ItemCard({ item }) {
  return (
    <Link to={`/items/${item.id}`}
      className="group surface flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
        <SafeImage src={item.imageUrl} alt={item.title} icon={item.categoryIcon}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold font-sans shadow-card ${item.free ? 'bg-forest-600 text-white' : 'bg-white text-ink-900'}`}>
          {priceLabel(item)}
        </span>
        {item.status === 'BORROWED' && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-soft px-2.5 py-1 text-xs font-medium text-amber-deep">On loan</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-ink-500">{item.categoryName} · {conditionLabel(item.condition)}</p>
        <h3 className="mt-1 line-clamp-2 text-[16px] font-medium leading-snug">{item.title}</h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-[13px] text-ink-500">
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-100 text-[10px] font-semibold text-forest-700">{initials(item.ownerName)}</span>
            <span className="truncate">{item.ownerName}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1"><MapPin size={13} className="shrink-0" /><span className="truncate">{item.location.split(',')[0]}</span></span>
        </div>
      </div>
    </Link>
  )
}

export function ItemCardSkeleton() {
  return (
    <div className="surface overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

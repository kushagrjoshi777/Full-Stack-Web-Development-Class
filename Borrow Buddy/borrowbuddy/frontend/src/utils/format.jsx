import {
  Wrench, Camera, Tent, ChefHat, Dumbbell, Music, BookOpen, Luggage, Flower2, Package,
} from 'lucide-react'

export const CATEGORY_ICONS = {
  wrench: Wrench, camera: Camera, tent: Tent, 'chef-hat': ChefHat, dumbbell: Dumbbell,
  music: Music, 'book-open': BookOpen, luggage: Luggage, 'flower-2': Flower2,
}

export const CategoryIcon = ({ name, ...props }) => {
  const Icon = CATEGORY_ICONS[name] || Package
  return <Icon {...props} />
}

export const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like new' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
]
export const conditionLabel = (v) => CONDITIONS.find((c) => c.value === v)?.label || v

export const priceLabel = (item) => (item.free ? 'Free' : `₹${Number(item.dailyPrice).toLocaleString('en-IN')}/day`)

export const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`

export const fmtDate = (d) =>
  d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export const fmtShort = (d) =>
  d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''

export const todayISO = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

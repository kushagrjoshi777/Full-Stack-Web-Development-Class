import { useState } from 'react'
import { Package } from 'lucide-react'
import { assetUrl } from '../api/client'
import { CategoryIcon } from '../utils/format'

/** Image that never shows a broken-image icon: falls back to a tinted category tile. */
export default function SafeImage({ src, alt, icon, className = '' }) {
  const [failed, setFailed] = useState(false)
  const url = assetUrl(src)
  if (!url || failed) {
    return (
      <div role="img" aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-forest-50 to-sand-100 text-forest-400 ${className}`}>
        {icon ? <CategoryIcon name={icon} size={40} strokeWidth={1.5} /> : <Package size={40} strokeWidth={1.5} />}
      </div>
    )
  }
  return <img src={url} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}

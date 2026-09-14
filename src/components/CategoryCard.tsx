import { Link } from 'react-router-dom'
import type { Category } from '../lib/types'
import { Icon, type IconName } from './Icon'

/**
 * Categories are a browse affordance, not decoration: each tile carries its
 * live restaurant count so a student can tell an empty aisle from a full one
 * before tapping it.
 */
export function CategoryCard({
  category,
  count,
  active = false,
}: {
  category: Category
  count: number
  active?: boolean
}) {
  return (
    <Link
      to={`/restaurants?category=${category.slug}`}
      className={`group flex cursor-pointer flex-col items-start gap-3 rounded-card p-5 ring-1 transition-colors duration-200 ${
        active
          ? 'bg-brand-600 text-white ring-brand-600'
          : 'bg-white ring-line/70 hover:bg-brand-50/70 hover:ring-brand-200'
      }`}
    >
      <span
        className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl transition-colors duration-200 ${
          active ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-600 group-hover:bg-white'
        }`}
      >
        {category.image ? (
          <img src={category.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon name={(category.icon || 'utensils') as IconName} className="h-6 w-6" />
        )}
      </span>
      <div>
        <h3 className={`text-base ${active ? 'text-white' : ''}`}>{category.name}</h3>
        <p className={`mt-0.5 text-sm ${active ? 'text-white/80' : 'text-muted'}`}>
          {count} ร้าน
        </p>
      </div>
      {category.description && (
        <p
          className={`line-clamp-2 text-sm ${active ? 'text-white/85' : 'text-body'}`}
        >
          {category.description}
        </p>
      )}
    </Link>
  )
}

/** Horizontal chip used above result grids. */
export function CategoryChip({
  label,
  icon,
  count,
  active,
  onClick,
}: {
  label: string
  icon?: IconName
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-colors duration-200 ${
        active
          ? 'bg-brand-600 text-white ring-brand-600'
          : 'bg-white text-body ring-line hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200'
      }`}
    >
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {label}
      {count != null && (
        <span className={active ? 'text-white/70' : 'text-muted'}>({count})</span>
      )}
    </button>
  )
}

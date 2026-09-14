import { Link } from 'react-router-dom'
import { formatHours, formatPriceRange, openStatusLabel } from '../lib/format'
import type { RestaurantView } from '../lib/types'
import { Icon } from './Icon'
import { SmartImage } from './SmartImage'
import { Stars } from './Stars'
import { Badge, OpenBadge } from './ui'

/**
 * The unit the whole directory is built from.
 *
 * Every value here comes from the store — nothing about a restaurant is
 * written into the markup, so a card appears, changes or disappears purely
 * from what the admin saved.
 */
export function RestaurantCard({ restaurant }: { restaurant: RestaurantView }) {
  const status = openStatusLabel(restaurant)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line/70 transition-shadow duration-300 hover:shadow-lift">
      <Link
        to={`/restaurant/${restaurant.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-brand-50"
        tabIndex={-1}
        aria-hidden="true"
      >
        <SmartImage
          src={restaurant.coverImage}
          alt=""
          fallbackLabel={restaurant.name}
          className="h-full w-full object-cover duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {restaurant.featured && (
            <Badge tone="gold" icon="sparkles" className="bg-white/95 backdrop-blur">
              แนะนำ
            </Badge>
          )}
        </span>
        <span className="absolute top-3 right-3">
          <span className="rounded-full bg-white/95 backdrop-blur">
            <OpenBadge open={status.open} label={status.label} />
          </span>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug">
            <Link
              to={`/restaurant/${restaurant.slug}`}
              className="transition-colors duration-200 hover:text-brand-700 focus-visible:text-brand-700"
            >
              {restaurant.name}
            </Link>
          </h3>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold-300/25 px-2 py-0.5 text-sm font-bold text-gold-700">
            <Icon name="star" solid className="h-3.5 w-3.5" />
            {restaurant.ratingAvg.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {restaurant.category && (
            <Badge tone="brand" icon="tag">
              {restaurant.category.name}
            </Badge>
          )}
          <Badge tone="gold" icon="coin">
            {formatPriceRange(restaurant.priceMin, restaurant.priceAvg)}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm text-body">{restaurant.description}</p>

        <dl className="mt-auto space-y-1.5 text-sm text-muted">
          <div className="flex items-center gap-2">
            <dt className="sr-only">เวลาเปิด-ปิด</dt>
            <Icon name="clock" className="h-4 w-4 shrink-0 text-brand-400" />
            <dd>{formatHours(restaurant)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">ที่อยู่</dt>
            <Icon name="pin" className="h-4 w-4 shrink-0 text-brand-400" />
            <dd className="line-clamp-1">{restaurant.address || 'ไม่ระบุที่อยู่'}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <Stars value={restaurant.ratingAvg} size="sm" />
            <span>({restaurant.reviewCount})</span>
          </span>
          <Link
            to={`/restaurant/${restaurant.slug}`}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-700"
          >
            ดูรายละเอียด
            <Icon name="arrowRight" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}

/** Compact variant used in the "ยอดนิยม" rail and on the map page. */
export function RestaurantRow({
  restaurant,
  rank,
}: {
  restaurant: RestaurantView
  rank?: number
}) {
  const status = openStatusLabel(restaurant)
  return (
    <Link
      to={`/restaurant/${restaurant.slug}`}
      className="group flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-line/70 transition-colors duration-200 hover:bg-brand-50/60 hover:ring-brand-200"
    >
      {rank != null && (
        <span className="w-7 shrink-0 text-center font-display text-xl text-brand-300 group-hover:text-brand-500">
          {rank}
        </span>
      )}
      <SmartImage
        src={restaurant.coverImage}
        alt=""
        fallbackLabel={restaurant.name}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{restaurant.name}</p>
        <p className="truncate text-sm text-muted">
          {restaurant.category?.name ?? 'ไม่ระบุหมวดหมู่'} ·{' '}
          {formatPriceRange(restaurant.priceMin, restaurant.priceAvg)}
        </p>
        <span className="mt-1 inline-flex items-center gap-2">
          <Stars value={restaurant.ratingAvg} size="sm" />
          <span className="text-xs text-muted">{restaurant.ratingAvg.toFixed(1)}</span>
        </span>
      </div>
      <span className="hidden shrink-0 sm:block">
        <OpenBadge open={status.open} label={status.label} />
      </span>
    </Link>
  )
}

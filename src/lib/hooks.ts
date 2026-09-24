import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import * as db from './db'
import { getSession, subscribeSession, type Session } from './auth'
import { isOpenNow, matches } from './format'
import type { Category, Database, RestaurantView, TeamMember } from './types'

/**
 * React bindings for the store.
 *
 * `useSyncExternalStore` subscribes every screen to the same document, so a
 * save in the admin tab repaints the public pages without a reload and without
 * any component owning a private copy of the data.
 */
export function useDatabase(): Database {
  return useSyncExternalStore(db.subscribe, db.getDatabase, db.getDatabase)
}

export function useTeamMembers(): TeamMember[] {
  const database = useDatabase()
  return useMemo(
    () => [...(database.teamMembers || [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [database],
  )
}

export function useCategories(): Category[] {
  const database = useDatabase()
  return useMemo(
    () => [...database.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [database],
  )
}

export function useRestaurantViews(): RestaurantView[] {
  const database = useDatabase()
  return useMemo(
    () =>
      [...database.restaurants]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((restaurant) => db.toView(restaurant, database)),
    [database],
  )
}

export function useRestaurantView(idOrSlug: string | undefined): RestaurantView | null {
  const database = useDatabase()
  return useMemo(() => {
    if (!idOrSlug) return null
    const restaurant = database.restaurants.find((r) => r.slug === idOrSlug || r.id === idOrSlug)
    return restaurant ? db.toView(restaurant, database) : null
  }, [database, idOrSlug])
}

export function useSessionState(): Session | null {
  return useSyncExternalStore(subscribeSession, getSession, getSession)
}

// ------------------------------------------------------------------ filters

export type SortKey = 'recommended' | 'rating' | 'price-asc' | 'price-desc' | 'newest'

export interface RestaurantFilters {
  query: string
  categoryId: string
  maxPrice: number | null
  openOnly: boolean
  sort: SortKey
}

export const defaultFilters: RestaurantFilters = {
  query: '',
  categoryId: '',
  maxPrice: null,
  openOnly: false,
  sort: 'recommended',
}

export function filterRestaurants(
  rows: RestaurantView[],
  filters: RestaurantFilters,
): RestaurantView[] {
  const { query, categoryId, maxPrice, openOnly, sort } = filters

  const result = rows.filter((restaurant) => {
    if (categoryId && restaurant.categoryId !== categoryId) return false
    if (maxPrice != null && restaurant.priceMin > maxPrice) return false
    if (openOnly && !isOpenNow(restaurant)) return false
    if (!query) return true
    // Search the name, the blurb, the address, the category and the menu —
    // students look for "กะเพรา" more often than they look for a shop name.
    const haystack = [
      restaurant.name,
      restaurant.description,
      restaurant.address,
      restaurant.category?.name ?? '',
      ...restaurant.menus.map((menu) => menu.name),
    ].join(' ')
    return matches(haystack, query.trim())
  })

  const sorters: Record<SortKey, (a: RestaurantView, b: RestaurantView) => number> = {
    recommended: (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      b.ratingAvg - a.ratingAvg ||
      b.reviewCount - a.reviewCount,
    rating: (a, b) => b.ratingAvg - a.ratingAvg || b.reviewCount - a.reviewCount,
    'price-asc': (a, b) => a.priceMin - b.priceMin,
    'price-desc': (a, b) => b.priceMin - a.priceMin,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  }
  return result.sort(sorters[sort])
}

// ------------------------------------------------------------------ helpers

/** Re-render on a timer so "เปิดอยู่ / ปิดแล้ว" badges stay honest. */
export function useClockTick(intervalMs = 60_000) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
}

export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

/** Lock body scroll while a modal or the mobile menu is open. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}

export function useOnEscape(handler: () => void, active = true) {
  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, handler])
}

/**
 * An open/closed flag that snaps shut whenever `token` changes — used by the
 * navbars to close their mobile menu on navigation.
 *
 * The reset happens during render rather than in an effect, so the menu is
 * never painted open on the new page for a frame before closing.
 */
export function useDismissOnChange(token: string): [boolean, (open: boolean) => void] {
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(token)
  if (seen !== token) {
    setSeen(token)
    setOpen(false)
  }
  return [open, setOpen]
}

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { matches } from '../lib/format'
import { useRestaurantViews } from '../lib/hooks'
import { Icon } from './Icon'

/**
 * The hero search box — the primary call to action on a directory site.
 *
 * Suggestions come out of the live store and match on shop name, category and
 * individual dishes, because students search for "กะเพรา" far more often than
 * for a shop's name.
 */
export function SearchBar({
  size = 'lg',
  placeholder = 'ค้นหาร้าน เมนู หรือประเภทอาหาร เช่น กะเพรา ก๋วยเตี๋ยว คาเฟ่',
}: {
  size?: 'md' | 'lg'
  placeholder?: string
}) {
  const navigate = useNavigate()
  const restaurants = useRestaurantViews()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const wrapper = useRef<HTMLDivElement>(null)

  const suggestions = query.trim()
    ? restaurants
        .filter((restaurant) =>
          matches(
            [
              restaurant.name,
              restaurant.category?.name ?? '',
              ...restaurant.menus.map((menu) => menu.name),
            ].join(' '),
            query.trim(),
          ),
        )
        .slice(0, 6)
    : []

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const chosen = suggestions[highlight]
    if (chosen) {
      navigate(`/restaurant/${chosen.slug}`)
    } else {
      navigate(`/restaurants?q=${encodeURIComponent(query.trim())}`)
    }
    setOpen(false)
  }

  const tall = size === 'lg'

  return (
    <div ref={wrapper} className="relative w-full">
      <form onSubmit={submit} role="search">
        <label htmlFor="site-search" className="sr-only">
          ค้นหาร้านอาหาร
        </label>
        <div
          className={`flex items-center gap-2 rounded-full bg-white p-1.5 shadow-lift ring-1 ring-line/70 focus-within:ring-2 focus-within:ring-brand-400 ${
            tall ? 'pl-5' : 'pl-4'
          }`}
        >
          <Icon name="search" className="h-5 w-5 shrink-0 text-brand-500" />
          <input
            id="site-search"
            type="search"
            value={query}
            placeholder={placeholder}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
              setHighlight(-1)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setHighlight((index) => Math.min(index + 1, suggestions.length - 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setHighlight((index) => Math.max(index - 1, -1))
              } else if (event.key === 'Escape') {
                setOpen(false)
              }
            }}
            aria-expanded={open && suggestions.length > 0}
            aria-controls="search-suggestions"
            className={`min-w-0 flex-1 bg-transparent text-ink placeholder:text-muted/70 focus:outline-none ${
              tall ? 'py-3 text-[1.02rem]' : 'py-2 text-[0.95rem]'
            }`}
          />
          <button
            type="submit"
            className={`shrink-0 cursor-pointer rounded-full bg-brand-600 font-semibold text-white transition-colors duration-200 hover:bg-brand-700 ${
              tall ? 'px-6 py-3' : 'px-4 py-2 text-sm'
            }`}
          >
            ค้นหา
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-80 animate-fade overflow-y-auto rounded-2xl bg-white p-2 text-left shadow-lift ring-1 ring-line scroll-thin"
        >
          {suggestions.map((restaurant, index) => (
            <li key={restaurant.id}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(index)}
                onClick={() => {
                  navigate(`/restaurant/${restaurant.slug}`)
                  setOpen(false)
                }}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
                  index === highlight ? 'bg-brand-50' : 'hover:bg-brand-50/60'
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                  <Icon name="store" className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink">{restaurant.name}</span>
                  <span className="block truncate text-sm text-muted">
                    {restaurant.category?.name ?? 'ไม่ระบุหมวดหมู่'} · ฿{restaurant.priceMin}+
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

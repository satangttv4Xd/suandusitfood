import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CategoryChip } from '../components/CategoryCard'
import { Icon, type IconName } from '../components/Icon'
import { RestaurantCard } from '../components/RestaurantCard'
import { Button, Checkbox, EmptyState, Input, Select, TogglePill } from '../components/ui'
import {
  filterRestaurants,
  useCategories,
  useClockTick,
  useRestaurantViews,
  type SortKey,
} from '../lib/hooks'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'recommended', label: 'แนะนำ' },
  { value: 'rating', label: 'คะแนนสูงสุด' },
  { value: 'price-asc', label: 'ราคาน้อยไปมาก' },
  { value: 'price-desc', label: 'ราคามากไปน้อย' },
  { value: 'newest', label: 'เพิ่มล่าสุด' },
]

const BUDGETS = [40, 60, 100]

/**
 * The directory listing.
 *
 * Filters live in the URL rather than in component state, so a filtered view
 * survives a reload and can be pasted to a friend — which is how students
 * actually share "ร้านใต้ 60 บาทที่เปิดอยู่ตอนนี้".
 */
export function Restaurants() {
  useClockTick()
  const [params, setParams] = useSearchParams()
  const restaurants = useRestaurantViews()
  const categories = useCategories()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = params.get('q') ?? ''
  const categorySlug = params.get('category') ?? ''
  const sort = (params.get('sort') as SortKey) ?? 'recommended'
  const openOnly = params.get('open') === '1'
  const maxPrice = params.get('max') ? Number(params.get('max')) : null

  const activeCategory = categories.find((category) => category.slug === categorySlug)

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    })
    setParams(next, { replace: true })
  }

  const results = useMemo(
    () =>
      filterRestaurants(restaurants, {
        query,
        categoryId: activeCategory?.id ?? '',
        maxPrice,
        openOnly,
        sort: SORTS.some((option) => option.value === sort) ? sort : 'recommended',
      }),
    [restaurants, query, activeCategory, maxPrice, openOnly, sort],
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    restaurants.forEach((restaurant) => {
      map.set(restaurant.categoryId, (map.get(restaurant.categoryId) ?? 0) + 1)
    })
    return map
  }, [restaurants])

  const hasFilters = Boolean(query || categorySlug || openOnly || maxPrice)

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-sm font-bold tracking-[0.14em] text-ink uppercase">ราคาเริ่มต้น</h2>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((budget) => (
            <TogglePill
              key={budget}
              checked={maxPrice === budget}
              onChange={(checked) => update({ max: checked ? String(budget) : null })}
            >
              ไม่เกิน ฿{budget}
            </TogglePill>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold tracking-[0.14em] text-ink uppercase">สถานะ</h2>
        <Checkbox
          label="แสดงเฉพาะร้านที่เปิดอยู่ตอนนี้"
          checked={openOnly}
          onChange={(event) => update({ open: event.target.checked ? '1' : null })}
        />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold tracking-[0.14em] text-ink uppercase">หมวดหมู่</h2>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => update({ category: null })}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-[0.95rem] transition-colors duration-200 ${
                !categorySlug ? 'bg-brand-50 font-semibold text-brand-700' : 'hover:bg-brand-50/60'
              }`}
            >
              ทุกหมวดหมู่
              <span className="text-sm text-muted">{restaurants.length}</span>
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => update({ category: category.slug })}
                className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[0.95rem] transition-colors duration-200 ${
                  categorySlug === category.slug
                    ? 'bg-brand-50 font-semibold text-brand-700'
                    : 'hover:bg-brand-50/60'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Icon
                    name={(category.icon || 'utensils') as IconName}
                    className="h-4 w-4 shrink-0 text-brand-500"
                  />
                  <span className="truncate">{category.name}</span>
                </span>
                <span className="text-sm text-muted">{counts.get(category.id) ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {hasFilters && (
        <Button
          variant="outline"
          icon="refresh"
          className="w-full"
          onClick={() => setParams(new URLSearchParams(), { replace: true })}
        >
          ล้างตัวกรองทั้งหมด
        </Button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">
          Restaurants
        </p>
        <h1 className="text-3xl sm:text-4xl">
          {activeCategory ? activeCategory.name : 'ร้านอาหารทั้งหมด'}
        </h1>
        <p className="mt-2 text-body">
          {activeCategory?.description ??
            'ค้นหาและกรองร้านอาหารภายในและรอบมหาวิทยาลัยสวนดุสิตได้ตามใจ'}
        </p>
      </header>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64">
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="ค้นหาชื่อร้าน เมนู หรือที่อยู่"
            aria-label="ค้นหาร้านอาหาร"
            className="pl-10"
          />
        </div>

        <Select
          value={sort}
          onChange={(event) => update({ sort: event.target.value })}
          aria-label="เรียงลำดับ"
          className="w-48"
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              เรียงตาม: {option.label}
            </option>
          ))}
        </Select>

        <Button
          variant="outline"
          icon="filter"
          className="lg:hidden"
          onClick={() => setFiltersOpen((value) => !value)}
          aria-expanded={filtersOpen}
        >
          ตัวกรอง
        </Button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
        <CategoryChip
          label="ทั้งหมด"
          active={!categorySlug}
          count={restaurants.length}
          onClick={() => update({ category: null })}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            icon={(category.icon || 'utensils') as IconName}
            count={counts.get(category.id) ?? 0}
            active={categorySlug === category.slug}
            onClick={() => update({ category: category.slug })}
          />
        ))}
      </div>

      {filtersOpen && (
        <div className="mb-6 animate-rise rounded-card bg-white p-5 ring-1 ring-line lg:hidden">
          {filterPanel}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-card bg-white p-5 ring-1 ring-line/70">
            {filterPanel}
          </div>
        </aside>

        <section aria-live="polite">
          <p className="mb-4 text-sm text-muted">
            พบ <strong className="text-ink">{results.length}</strong> ร้าน
            {hasFilters && ' ตามเงื่อนไขที่เลือก'}
          </p>

          {results.length === 0 ? (
            <EmptyState
              title="ไม่พบร้านที่ตรงกับเงื่อนไข"
              description="ลองเปลี่ยนคำค้นหา ปรับช่วงราคา หรือล้างตัวกรองแล้วดูอีกครั้ง"
              action={
                <Button
                  icon="refresh"
                  onClick={() => setParams(new URLSearchParams(), { replace: true })}
                >
                  ล้างตัวกรอง
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

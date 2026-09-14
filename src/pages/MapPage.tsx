import { useState } from 'react'
import { Icon } from '../components/Icon'
import { SmartImage } from '../components/SmartImage'
import { ButtonLink, EmptyState, OpenBadge } from '../components/ui'
import { formatHours, formatPriceRange, mapEmbedUrl, mapLinkUrl, openStatusLabel } from '../lib/format'
import { useClockTick, useRestaurantViews } from '../lib/hooks'

const CAMPUS = {
  name: 'มหาวิทยาลัยสวนดุสิต',
  address: '295 ถนนนครราชสีมา เขตดุสิต กรุงเทพมหานคร 10300',
  lat: 13.7772,
  lng: 100.5186,
}

/**
 * Map view.
 *
 * Google's `output=embed` form needs no API key, so the map works on a fresh
 * checkout with nothing to configure. Picking a shop from the list re-points
 * the iframe rather than opening a new page.
 */
export function MapPage() {
  useClockTick()
  const restaurants = useRestaurantViews()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // A shop deleted in another tab simply stops matching, and the map falls
  // back to the campus pin — no cleanup effect needed.
  const selected = restaurants.find((restaurant) => restaurant.id === selectedId) ?? null
  const target = selected ?? CAMPUS

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">Map</p>
        <h1 className="text-3xl sm:text-4xl">แผนที่ร้านอาหาร</h1>
        <p className="mt-2 text-body">
          เลือกร้านจากรายการเพื่อดูตำแหน่งบนแผนที่ แล้วกดนำทางด้วย Google Maps ได้ทันที
        </p>
      </header>

      {restaurants.length === 0 ? (
        <EmptyState
          icon="map"
          title="ยังไม่มีร้านให้แสดงบนแผนที่"
          description="ผู้ดูแลระบบสามารถเพิ่มร้านพร้อมพิกัด Latitude / Longitude ได้จากระบบหลังบ้าน"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="order-2 min-w-0 lg:order-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-[0.14em] text-ink uppercase">
                ร้านทั้งหมด ({restaurants.length})
              </h2>
              {selected && (
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="cursor-pointer text-sm font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-700"
                >
                  กลับไปที่มหาวิทยาลัย
                </button>
              )}
            </div>

            <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1 scroll-thin lg:max-h-[38rem]">
              {restaurants.map((restaurant) => {
                const status = openStatusLabel(restaurant)
                const active = restaurant.id === selectedId
                return (
                  <li key={restaurant.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(restaurant.id)}
                      aria-pressed={active}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 text-left ring-1 transition-colors duration-200 ${
                        active
                          ? 'bg-brand-50 ring-brand-300'
                          : 'bg-white ring-line/70 hover:bg-brand-50/60 hover:ring-brand-200'
                      }`}
                    >
                      <SmartImage
                        src={restaurant.coverImage}
                        alt=""
                        fallbackLabel={restaurant.name}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink">
                          {restaurant.name}
                        </span>
                        <span className="block truncate text-sm text-muted">
                          {restaurant.address || 'ไม่ระบุที่อยู่'}
                        </span>
                        <span className="mt-1 inline-block">
                          <OpenBadge open={status.open} label={status.label} />
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line/70">
              <iframe
                key={selected?.id ?? 'campus'}
                title={`แผนที่ ${target.name}`}
                src={mapEmbedUrl(target)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full border-0 sm:aspect-[16/9] lg:aspect-[16/11]"
              />
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <h2 className="truncate text-lg">{target.name}</h2>
                  <p className="truncate text-sm text-muted">{target.address}</p>
                  {selected && (
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-body">
                      <span className="flex items-center gap-1.5">
                        <Icon name="clock" className="h-4 w-4 text-brand-400" />
                        {formatHours(selected)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="coin" className="h-4 w-4 text-brand-400" />
                        {formatPriceRange(selected.priceMin, selected.priceAvg)}
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected && (
                    <ButtonLink
                      to={`/restaurant/${selected.slug}`}
                      variant="outline"
                      iconRight="arrowRight"
                    >
                      ดูรายละเอียด
                    </ButtonLink>
                  )}
                  <a
                    href={mapLinkUrl({ ...target, mapUrl: selected?.mapUrl ?? '' })}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-navy-700 px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-navy-600"
                  >
                    <Icon name="map" className="h-4 w-4" />
                    นำทาง
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

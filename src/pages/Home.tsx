import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { RestaurantCard, RestaurantRow } from '../components/RestaurantCard'
import { SmartImage } from '../components/SmartImage'
import { ButtonLink, EmptyState, SectionHeading } from '../components/ui'
import { formatPriceRange } from '../lib/format'
import { useClockTick, useRestaurantViews } from '../lib/hooks'


export function Home() {
  useClockTick()
  const restaurants = useRestaurantViews()

  const featured = useMemo(() => {
    const picks = restaurants.filter((restaurant) => restaurant.featured)
    return (picks.length ? picks : restaurants).slice(0, 6)
  }, [restaurants])

  const popular = useMemo(
    () =>
      [...restaurants]
        .sort((a, b) => b.ratingAvg - a.ratingAvg || b.reviewCount - a.reviewCount)
        .slice(0, 5),
    [restaurants],
  )

  const cheapest = useMemo(
    () =>
      [...restaurants]
        .filter((restaurant) => restaurant.priceMin > 0)
        .sort((a, b) => a.priceMin - b.priceMin)
        .slice(0, 3),
    [restaurants],
  )


  return (
    <>
      {/* ---------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-cream to-cream"
          aria-hidden="true"
        />
        <div
          className="absolute -top-32 -right-24 -z-10 h-96 w-96 rounded-full bg-gold-300/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-40 -left-32 -z-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl"
          aria-hidden="true"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-8 lg:pt-20 lg:pb-24">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold tracking-[0.12em] text-brand-700 uppercase ring-1 ring-brand-100">
              <Icon name="cap" className="h-4 w-4" />
              คู่มือกินของนักศึกษาสวนดุสิต
            </span>

            <h1 className="mt-5 text-4xl leading-[1.12] sm:text-5xl lg:text-[3.4rem]">
              ร้านอาหารแนะนำ
              <br />
              <span className="text-brand-600">ในสวนดุสิต</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-body">
              รวมร้านอาหารภายในและรอบมหาวิทยาลัย ทั้งอาหารตามสั่ง ก๋วยเตี๋ยว คาเฟ่
              และของหวาน พร้อมราคา เวลาเปิด-ปิด และแผนที่ครบในที่เดียว
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <ButtonLink to="/restaurants" size="lg" iconRight="arrowRight" className="shadow-md">
                ดูร้านอาหารทั้งหมด
              </ButtonLink>
              <ButtonLink to="/map" size="lg" variant="outline" icon="map" className="shadow-xs">
                ดูแผนที่ร้าน
              </ButtonLink>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3.5 shadow-xs ring-1 ring-line/80 backdrop-blur-xs">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon name="store" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted">รวมร้านอร่อย</p>
                  <p className="text-sm font-bold text-ink">รอบ ม.สวนดุสิต</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3.5 shadow-xs ring-1 ring-line/80 backdrop-blur-xs">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Icon name="clock" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted">เวลาเปิด-ปิด</p>
                  <p className="text-sm font-bold text-ink">อัปเดตสถานะร้าน</p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 rounded-2xl bg-white/80 p-3.5 shadow-xs ring-1 ring-line/80 backdrop-blur-xs sm:col-span-1">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="map" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-muted">พิกัดแผนที่</p>
                  <p className="text-sm font-bold text-ink">นำทางไปร้านได้</p>
                </div>
              </div>
            </div>
          </div>

          {/* A live collage of whatever is currently in the database. */}
          <div className="relative hidden animate-rise lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-10">
                {restaurants.slice(0, 2).map((restaurant) => (
                  <Link
                    key={restaurant.id}
                    to={`/restaurant/${restaurant.slug}`}
                    className="block overflow-hidden rounded-3xl shadow-card ring-1 ring-line/60 transition-shadow duration-300 hover:shadow-lift"
                  >
                    <SmartImage
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      loading="eager"
                      fallbackLabel={restaurant.name}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </Link>
                ))}
              </div>
              <div className="space-y-4">
                {restaurants.slice(2, 4).map((restaurant) => (
                  <Link
                    key={restaurant.id}
                    to={`/restaurant/${restaurant.slug}`}
                    className="block overflow-hidden rounded-3xl shadow-card ring-1 ring-line/60 transition-shadow duration-300 hover:shadow-lift"
                  >
                    <SmartImage
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      loading="eager"
                      fallbackLabel={restaurant.name}
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- ร้านแนะนำ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Featured"
          title="ร้านแนะนำ"
          description="คัดจากร้านที่ทีมงานปักหมุดไว้ อร่อย ราคาเป็นมิตร และไปถึงง่ายจากมหาวิทยาลัย"
          action={
            <ButtonLink to="/restaurants" variant="outline" iconRight="arrowRight">
              ดูร้านทั้งหมด
            </ButtonLink>
          }
        />

        {featured.length === 0 ? (
          <EmptyState
            icon="store"
            title="ยังไม่มีร้านอาหารในระบบ"
            description="ผู้ดูแลระบบสามารถเพิ่มร้านแรกได้จากระบบหลังบ้าน แล้วร้านจะขึ้นบนหน้านี้ทันที"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>


      {/* --------------------------------------------- ร้านยอดนิยม */}
      {popular.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <SectionHeading
                eyebrow="Popular"
                title="ร้านยอดนิยม"
                description="เรียงตามคะแนนรีวิวจากนักศึกษาที่ไปกินมาแล้วจริง"
              />
              <ol className="space-y-3">
                {popular.map((restaurant, index) => (
                  <li key={restaurant.id}>
                    <RestaurantRow restaurant={restaurant} rank={index + 1} />
                  </li>
                ))}
              </ol>
            </div>

            <aside className="min-w-0 self-start rounded-card bg-gradient-to-br from-navy-600 to-navy-800 p-6 text-white sm:p-7">
              <h2 className="flex items-center gap-2 text-xl text-white">
                <Icon name="coin" className="h-5 w-5 text-gold-400" />
                งบไม่ถึงร้อย
              </h2>
              <p className="mt-2 text-sm text-navy-100">
                สามร้านที่ราคาเริ่มต้นถูกที่สุดในตอนนี้ เหมาะกับช่วงปลายเดือน
              </p>
              <ul className="mt-6 space-y-3">
                {cheapest.map((restaurant) => (
                  <li key={restaurant.id}>
                    <Link
                      to={`/restaurant/${restaurant.slug}`}
                      className="flex items-center gap-3 rounded-2xl bg-navy-900/40 p-3 ring-1 ring-white/15 transition-colors duration-200 hover:bg-navy-900/20 hover:ring-white/35"
                    >
                      <SmartImage
                        src={restaurant.coverImage}
                        alt=""
                        fallbackLabel={restaurant.name}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-white">
                          {restaurant.name}
                        </span>
                        <span className="block text-sm font-semibold text-gold-300">
                          {formatPriceRange(restaurant.priceMin, restaurant.priceAvg)}
                        </span>
                      </span>
                      <Icon name="chevronRight" className="h-4 w-4 shrink-0 text-navy-100" />
                    </Link>
                  </li>
                ))}
              </ul>
              <ButtonLink
                to="/restaurants?sort=price-asc"
                variant="gold"
                className="mt-6 w-full"
                iconRight="arrowRight"
              >
                ดูร้านราคาประหยัด
              </ButtonLink>
            </aside>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------- CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-card bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-10 text-white">
          <div className="max-w-xl">
            <h2 className="text-2xl text-white sm:text-3xl">รู้จักร้านอร่อยที่ยังไม่มีในนี้?</h2>
            <p className="mt-2 text-white/85">
              ส่งชื่อร้านมาให้ทีมผู้ดูแล แล้วเราจะเพิ่มลงในคู่มือให้เพื่อน ๆ ได้ใช้กัน
            </p>
          </div>
          <ButtonLink to="/about" variant="gold" size="lg" iconRight="arrowRight">
            วิธีแนะนำร้าน
          </ButtonLink>
        </div>
      </section>
    </>
  )
}

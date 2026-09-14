import { CategoryCard } from '../components/CategoryCard'
import { RestaurantRow } from '../components/RestaurantCard'
import { ButtonLink, EmptyState } from '../components/ui'
import { useCategories, useClockTick, useRestaurantViews } from '../lib/hooks'

/**
 * Category index — every category with its live count, plus a short preview of
 * what is inside so the page is useful on its own rather than a menu of links.
 */
export function Categories() {
  useClockTick()
  const categories = useCategories()
  const restaurants = useRestaurantViews()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-2xl">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">
          Categories
        </p>
        <h1 className="text-3xl sm:text-4xl">หมวดหมู่ร้านอาหาร</h1>
        <p className="mt-2 text-body">
          เลือกประเภทอาหารที่อยากกินวันนี้ แล้วดูเฉพาะร้านในหมวดนั้นพร้อมราคาและเวลาเปิด-ปิด
        </p>
      </header>

      {categories.length === 0 ? (
        <EmptyState
          icon="tag"
          title="ยังไม่มีหมวดหมู่ในระบบ"
          description="ผู้ดูแลระบบสามารถเพิ่มหมวดหมู่ได้จากระบบหลังบ้าน"
        />
      ) : (
        <div className="space-y-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={
                  restaurants.filter((restaurant) => restaurant.categoryId === category.id).length
                }
              />
            ))}
          </div>

          {categories.map((category) => {
            const rows = restaurants
              .filter((restaurant) => restaurant.categoryId === category.id)
              .slice(0, 4)
            if (!rows.length) return null
            return (
              <section key={category.id}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <h2 className="text-2xl">{category.name}</h2>
                  <ButtonLink
                    to={`/restaurants?category=${category.slug}`}
                    variant="ghost"
                    size="sm"
                    iconRight="arrowRight"
                  >
                    ดูทั้งหมด
                  </ButtonLink>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {rows.map((restaurant) => (
                    <li key={restaurant.id} className="min-w-0">
                      <RestaurantRow restaurant={restaurant} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

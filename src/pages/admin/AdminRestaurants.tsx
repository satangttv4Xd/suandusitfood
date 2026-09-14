import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { ConfirmDialog } from '../../components/Modal'
import { SmartImage } from '../../components/SmartImage'
import { useToast } from '../../components/toast-context'
import { Badge, Button, ButtonLink, EmptyState, Input, OpenBadge, Select } from '../../components/ui'
import { deleteRestaurant, updateRestaurant } from '../../lib/db'
import { formatHours, formatPriceRange, matches, openStatusLabel } from '../../lib/format'
import { useCategories, useClockTick, useRestaurantViews } from '../../lib/hooks'
import type { RestaurantView } from '../../lib/types'
import { AdminPageHeader } from './AdminLayout'

export function AdminRestaurants() {
  useClockTick()
  const restaurants = useRestaurantViews()
  const categories = useCategories()
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [pendingDelete, setPendingDelete] = useState<RestaurantView | null>(null)

  const rows = useMemo(
    () =>
      restaurants.filter((restaurant) => {
        if (categoryId && restaurant.categoryId !== categoryId) return false
        if (status && restaurant.status !== status) return false
        return matches(`${restaurant.name} ${restaurant.address} ${restaurant.phone}`, query.trim())
      }),
    [restaurants, categoryId, status, query],
  )

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteRestaurant(pendingDelete.id)
    toast.success(`ลบร้าน "${pendingDelete.name}" พร้อมเมนูและรูปทั้งหมดแล้ว`)
    setPendingDelete(null)
  }

  const toggleFeatured = (restaurant: RestaurantView) => {
    updateRestaurant(restaurant.id, { featured: !restaurant.featured })
    toast.info(
      restaurant.featured
        ? `นำ "${restaurant.name}" ออกจากร้านแนะนำแล้ว`
        : `ตั้ง "${restaurant.name}" เป็นร้านแนะนำแล้ว`,
    )
  }

  return (
    <>
      <AdminPageHeader
        title="จัดการร้านอาหาร"
        description={`มีทั้งหมด ${restaurants.length} ร้านในระบบ`}
        action={
          <ButtonLink to="/admin/restaurants/new" icon="plus">
            เพิ่มร้านใหม่
          </ButtonLink>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3 rounded-card bg-white p-4 ring-1 ring-line/70">
        <div className="relative min-w-0 flex-1 basis-56">
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่อร้าน ที่อยู่ หรือเบอร์โทร"
            aria-label="ค้นหาร้าน"
            className="pl-10"
          />
        </div>
        <Select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          aria-label="กรองตามหมวดหมู่"
          className="w-52"
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="กรองตามสถานะ"
          className="w-44"
        >
          <option value="">ทุกสถานะ</option>
          <option value="open">เปิดให้บริการ</option>
          <option value="closed">ปิดชั่วคราว</option>
        </Select>
        {(query || categoryId || status) && (
          <Button
            variant="ghost"
            icon="refresh"
            onClick={() => {
              setQuery('')
              setCategoryId('')
              setStatus('')
            }}
          >
            ล้าง
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="store"
          title={restaurants.length ? 'ไม่พบร้านที่ตรงกับเงื่อนไข' : 'ยังไม่มีร้านในระบบ'}
          description={
            restaurants.length
              ? 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง'
              : 'เพิ่มร้านแรกของคุณ แล้วร้านจะแสดงบนหน้าเว็บไซต์ทันที'
          }
          action={
            restaurants.length ? undefined : (
              <ButtonLink to="/admin/restaurants/new" icon="plus">
                เพิ่มร้านใหม่
              </ButtonLink>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-card bg-white ring-1 ring-line/70">
          {/* Desktop: a real table. Mobile: the same rows as stacked cards. */}
          <table className="hidden w-full text-left lg:table">
            <thead className="bg-neutral-50 text-sm text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">ร้านอาหาร</th>
                <th scope="col" className="px-5 py-3 font-semibold">หมวดหมู่</th>
                <th scope="col" className="px-5 py-3 font-semibold">ราคา</th>
                <th scope="col" className="px-5 py-3 font-semibold">เวลา</th>
                <th scope="col" className="px-5 py-3 font-semibold">สถานะ</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((restaurant) => {
                const state = openStatusLabel(restaurant)
                return (
                  <tr key={restaurant.id} className="transition-colors duration-150 hover:bg-brand-50/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <SmartImage
                          src={restaurant.coverImage}
                          alt=""
                          fallbackLabel={restaurant.name}
                          className="h-12 w-12 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/restaurants/${restaurant.id}`}
                            className="block truncate font-semibold text-ink transition-colors duration-200 hover:text-brand-700"
                          >
                            {restaurant.name}
                          </Link>
                          <span className="block truncate text-sm text-muted">
                            {restaurant.menus.length} เมนู · {restaurant.images.length + 1} รูป
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm">
                      {restaurant.category ? (
                        <Badge tone="brand">{restaurant.category.name}</Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-body">
                      {formatPriceRange(restaurant.priceMin, restaurant.priceAvg)}
                    </td>
                    <td className="px-5 py-3 text-sm text-body">{formatHours(restaurant)}</td>
                    <td className="px-5 py-3">
                      <OpenBadge open={state.open} label={state.label} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(restaurant)}
                          aria-label={restaurant.featured ? 'นำออกจากร้านแนะนำ' : 'ตั้งเป็นร้านแนะนำ'}
                          title={restaurant.featured ? 'นำออกจากร้านแนะนำ' : 'ตั้งเป็นร้านแนะนำ'}
                          className={`cursor-pointer rounded-lg p-2 transition-colors duration-200 ${
                            restaurant.featured
                              ? 'text-gold-600 hover:bg-gold-300/25'
                              : 'text-neutral-300 hover:bg-neutral-100 hover:text-gold-600'
                          }`}
                        >
                          <Icon name="star" solid className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/restaurant/${restaurant.slug}`}
                          aria-label={`ดูหน้าเว็บของ ${restaurant.name}`}
                          title="ดูหน้าเว็บ"
                          className="cursor-pointer rounded-lg p-2 text-muted transition-colors duration-200 hover:bg-neutral-100 hover:text-ink"
                        >
                          <Icon name="eye" className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/restaurants/${restaurant.id}`}
                          aria-label={`แก้ไข ${restaurant.name}`}
                          title="แก้ไข"
                          className="cursor-pointer rounded-lg p-2 text-navy-600 transition-colors duration-200 hover:bg-navy-50"
                        >
                          <Icon name="pencil" className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(restaurant)}
                          aria-label={`ลบ ${restaurant.name}`}
                          title="ลบ"
                          className="cursor-pointer rounded-lg p-2 text-brand-600 transition-colors duration-200 hover:bg-brand-50"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <ul className="divide-y divide-line lg:hidden">
            {rows.map((restaurant) => {
              const state = openStatusLabel(restaurant)
              return (
                <li key={restaurant.id} className="p-4">
                  <div className="flex gap-3">
                    <SmartImage
                      src={restaurant.coverImage}
                      alt=""
                      fallbackLabel={restaurant.name}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/admin/restaurants/${restaurant.id}`}
                        className="block truncate font-semibold text-ink"
                      >
                        {restaurant.name}
                      </Link>
                      <p className="truncate text-sm text-muted">
                        {restaurant.category?.name ?? 'ไม่ระบุหมวดหมู่'} ·{' '}
                        {formatPriceRange(restaurant.priceMin, restaurant.priceAvg)}
                      </p>
                      <p className="mt-1.5 flex flex-wrap gap-1.5">
                        <OpenBadge open={state.open} label={state.label} />
                        {restaurant.featured && (
                          <Badge tone="gold" icon="sparkles">
                            แนะนำ
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ButtonLink
                      to={`/admin/restaurants/${restaurant.id}`}
                      size="sm"
                      variant="outline"
                      icon="pencil"
                    >
                      แก้ไข
                    </ButtonLink>
                    <Button size="sm" variant="ghost" icon="star" onClick={() => toggleFeatured(restaurant)}>
                      {restaurant.featured ? 'เลิกแนะนำ' : 'ตั้งเป็นแนะนำ'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon="trash"
                      onClick={() => setPendingDelete(restaurant)}
                    >
                      ลบ
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="ยืนยันการลบร้าน"
        message={
          <>
            ต้องการลบ <strong className="text-ink">{pendingDelete?.name}</strong> ใช่หรือไม่?
            <br />
            เมนู {pendingDelete?.menus.length ?? 0} รายการ, รูปในแกลเลอรี{' '}
            {pendingDelete?.images.length ?? 0} รูป และรีวิว {pendingDelete?.reviewCount ?? 0} รายการ
            จะถูกลบไปพร้อมกัน และไม่สามารถกู้คืนได้
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

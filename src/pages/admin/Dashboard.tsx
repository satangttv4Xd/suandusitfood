import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../../components/Icon'
import { SmartImage } from '../../components/SmartImage'
import { Badge, Button, ButtonLink, EmptyState, OpenBadge } from '../../components/ui'
import { useToast } from '../../components/toast-context'
import { getStorageUsage, uploadLocalDatabaseToCloud, syncDatabaseWithCloud } from '../../lib/db'
import { formatBytes } from '../../lib/image'
import { formatPriceRange, formatRelative, isOpenNow, openStatusLabel } from '../../lib/format'
import { useClockTick, useDatabase, useRestaurantViews } from '../../lib/hooks'
import { AdminPageHeader } from './AdminLayout'

const cards: {
  key: string
  label: string
  icon: IconName
  tint: string
  to: string
}[] = [
  { key: 'restaurants', label: 'ร้านอาหารทั้งหมด', icon: 'store', tint: 'bg-brand-50 text-brand-600', to: '/admin/restaurants' },
  { key: 'menus', label: 'เมนูอาหาร', icon: 'utensils', tint: 'bg-gold-300/25 text-gold-700', to: '/admin/menus' },
  { key: 'reviews', label: 'รีวิวทั้งหมด', icon: 'message', tint: 'bg-navy-50 text-navy-700', to: '/admin/reviews' },
  { key: 'openNow', label: 'ร้านที่เปิดอยู่ตอนนี้', icon: 'clock', tint: 'bg-emerald-50 text-emerald-700', to: '/restaurants?open=1' },
]

export function Dashboard() {
  useClockTick()
  const database = useDatabase()
  const restaurants = useRestaurantViews()
  const toast = useToast()
  const [syncing, setSyncing] = useState(false)

  const handleUploadToCloud = async () => {
    setSyncing(true)
    try {
      const res = await uploadLocalDatabaseToCloud()
      if (res.success) {
        toast.success(
          `อัปโหลดข้อมูลจากเครื่องนี้ขึ้น Supabase สำเร็จแล้ว! (${res.counts.restaurants} ร้าน, ${res.counts.team} สมาชิก, ${res.counts.menus} เมนู)`,
        )
      }
    } catch (err: any) {
      toast.error(err?.message || 'เกิดข้อผิดพลาดในการอัปโหลดขึ้น Cloud')
    } finally {
      setSyncing(false)
    }
  }

  const handlePullFromCloud = async () => {
    setSyncing(true)
    try {
      const ok = await syncDatabaseWithCloud(true)
      if (ok) {
        toast.success('ดึงข้อมูลล่าสุดจาก Supabase Cloud สำเร็จแล้ว!')
      } else {
        toast.info('ข้อมูลเป็นเวอร์ชันล่าสุดแล้ว')
      }
    } catch {
      toast.error('ไม่สามารถดึงข้อมูลจาก Cloud ได้')
    } finally {
      setSyncing(false)
    }
  }

  const stats: Record<string, number> = {
    restaurants: restaurants.length,
    menus: database.menus.length,
    reviews: database.reviews.length,
    openNow: database.restaurants.filter((restaurant) => isOpenNow(restaurant)).length,
  }

  const recent = restaurants.slice(0, 5)
  const storage = getStorageUsage()
  const uncategorised = restaurants.filter((restaurant) => !restaurant.category).length
  const withoutMenu = restaurants.filter((restaurant) => restaurant.menus.length === 0).length

  return (
    <>
      <AdminPageHeader
        title="ภาพรวมระบบ"
        description="สรุปข้อมูลทั้งหมดในฐานข้อมูล และทางลัดไปยังงานที่ทำบ่อย"
        action={
          <ButtonLink to="/admin/restaurants/new" icon="plus">
            เพิ่มร้านใหม่
          </ButtonLink>
        }
      />

      {/* Supabase Cloud Sync Quick Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 p-4 sm:p-5 text-white shadow-md ring-1 ring-white/15">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-400 text-navy-950 font-bold shadow-xs">
            <Icon name="sparkles" className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">เชื่อมต่อ Supabase Database แล้ว</p>
              <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                พร้อมซิงค์
              </span>
            </div>
            <p className="text-xs text-navy-100/80 mt-0.5">
              กดปุ่มด้านขวาเพื่อส่งข้อมูลทั้งหมดที่คุณเคยกรอกไว้ในเครื่องนี้ขึ้น Cloud ให้แสดงบนมือถือทันที
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="gold"
            size="sm"
            icon="upload"
            onClick={handleUploadToCloud}
            disabled={syncing}
          >
            {syncing ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลเครื่องนี้ขึ้น Cloud'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon="refresh"
            onClick={handlePullFromCloud}
            disabled={syncing}
            className="text-white border-white/20 hover:bg-white/10"
          >
            ดึงจาก Cloud
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            to={card.to}
            className="group rounded-card bg-white p-5 ring-1 ring-line/70 transition-shadow duration-300 hover:shadow-card"
          >
            <div className="flex items-start justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.tint}`}>
                <Icon name={card.icon} className="h-5 w-5" />
              </span>
              <Icon
                name="chevronRight"
                className="h-4 w-4 text-neutral-300 transition-colors duration-200 group-hover:text-brand-500"
              />
            </div>
            <p className="mt-4 font-display text-4xl text-ink">{stats[card.key]}</p>
            <p className="mt-0.5 text-sm text-muted">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* ------------------------------------------- recently added */}
        <section className="min-w-0 rounded-card bg-white p-6 ring-1 ring-line/70">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg">ร้านที่เพิ่มล่าสุด</h2>
            <Link
              to="/admin/restaurants"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-700"
            >
              ดูทั้งหมด
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon="store"
              title="ยังไม่มีร้านในระบบ"
              description="เริ่มต้นด้วยการเพิ่มร้านแรก แล้วร้านจะแสดงบนหน้าเว็บไซต์ทันที"
              action={<ButtonLink to="/admin/restaurants/new" icon="plus">เพิ่มร้านใหม่</ButtonLink>}
            />
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((restaurant) => {
                const status = openStatusLabel(restaurant)
                return (
                  <li key={restaurant.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <SmartImage
                      src={restaurant.coverImage}
                      alt=""
                      fallbackLabel={restaurant.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/admin/restaurants/${restaurant.id}`}
                        className="block truncate font-semibold text-ink transition-colors duration-200 hover:text-brand-700"
                      >
                        {restaurant.name}
                      </Link>
                      <p className="truncate text-sm text-muted">
                        {restaurant.category?.name ?? 'ไม่ระบุหมวดหมู่'} ·{' '}
                        {formatPriceRange(restaurant.priceMin, restaurant.priceAvg)} ·{' '}
                        {restaurant.menus.length} เมนู
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <OpenBadge open={status.open} label={status.label} />
                      <p className="mt-1 text-xs text-muted">
                        เพิ่ม {formatRelative(restaurant.createdAt)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* ------------------------------------------------ side rail */}
        <div className="min-w-0 space-y-6">
          <section className="rounded-card bg-white p-6 ring-1 ring-line/70">
            <h2 className="text-lg">พื้นที่จัดเก็บข้อมูล</h2>
            <p className="mt-1 text-sm text-muted">
              ข้อมูลและรูปภาพทั้งหมดถูกเก็บใน localStorage ของเบราว์เซอร์นี้
            </p>
            <div className="mt-4">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-ink">{formatBytes(storage.bytes)}</span>
                <span className="text-muted">จาก ~{formatBytes(storage.quota)}</span>
              </div>
              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full bg-neutral-100"
                role="progressbar"
                aria-valuenow={storage.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="พื้นที่จัดเก็บที่ใช้ไป"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ${
                    storage.percent > 80
                      ? 'bg-brand-600'
                      : storage.percent > 55
                        ? 'bg-gold-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(2, storage.percent)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-muted">
                ใช้ไปแล้ว {storage.percent}% · รูปที่อัปโหลดถูกย่อขนาดอัตโนมัติก่อนบันทึก
              </p>
            </div>
            <ButtonLink to="/admin/settings" variant="outline" size="sm" icon="download" className="mt-4 w-full">
              สำรอง / กู้คืนข้อมูล
            </ButtonLink>
          </section>

          <section className="rounded-card bg-white p-6 ring-1 ring-line/70">
            <h2 className="text-lg">สิ่งที่ควรตรวจสอบ</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Icon
                  name={uncategorised ? 'alert' : 'check'}
                  className={`mt-0.5 h-4 w-4 shrink-0 ${uncategorised ? 'text-brand-600' : 'text-emerald-600'}`}
                />
                <span className="text-body">
                  {uncategorised
                    ? `มี ${uncategorised} ร้านที่ยังไม่ได้เลือกหมวดหมู่`
                    : 'ทุกร้านมีหมวดหมู่เรียบร้อย'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon
                  name={withoutMenu ? 'alert' : 'check'}
                  className={`mt-0.5 h-4 w-4 shrink-0 ${withoutMenu ? 'text-brand-600' : 'text-emerald-600'}`}
                />
                <span className="text-body">
                  {withoutMenu
                    ? `มี ${withoutMenu} ร้านที่ยังไม่มีเมนูอาหาร`
                    : 'ทุกร้านมีเมนูอย่างน้อย 1 รายการ'}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="users" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span className="text-body">
                  สมาชิกผู้จัดทำ {database.teamMembers?.length ?? 0} คน (
                  <Link to="/admin/team" className="font-semibold text-brand-700 hover:underline">
                    จัดการข้อมูล
                  </Link>
                  )
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="message" className="mt-0.5 h-4 w-4 shrink-0 text-navy-600" />
                <span className="text-body">
                  มีรีวิวทั้งหมด {database.reviews.length} รายการ
                </span>
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="brand" icon="image">
                รูปในแกลเลอรี {database.restaurantImages.length} รูป
              </Badge>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

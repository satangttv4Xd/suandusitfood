import { useMemo, useState } from 'react'
import { Icon } from '../../components/Icon'
import { ConfirmDialog } from '../../components/Modal'
import { Stars } from '../../components/Stars'
import { useToast } from '../../components/toast-context'
import { Button, EmptyState, Input, Select } from '../../components/ui'
import { deleteReview } from '../../lib/db'
import { formatThaiDate, matches } from '../../lib/format'
import { useDatabase } from '../../lib/hooks'
import type { Review } from '../../lib/types'
import { AdminPageHeader } from './AdminLayout'

/**
 * Review moderation.
 *
 * Reviews are written by visitors on the public detail page, so this screen
 * exists to take down anything abusive or off-topic. There is no edit action
 * on purpose — quietly rewriting someone's review would be worse than removing
 * it outright.
 */
export function AdminReviews() {
  const database = useDatabase()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [restaurantFilter, setRestaurantFilter] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Review | null>(null)

  const restaurants = useMemo(
    () => [...database.restaurants].sort((a, b) => a.name.localeCompare(b.name, 'th')),
    [database.restaurants],
  )
  const nameById = useMemo(
    () => new Map(restaurants.map((restaurant) => [restaurant.id, restaurant.name])),
    [restaurants],
  )

  const rows = useMemo(
    () =>
      database.reviews
        .filter((review) => {
          if (restaurantFilter && review.restaurantId !== restaurantFilter) return false
          return matches(`${review.author} ${review.comment}`, query.trim())
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [database.reviews, restaurantFilter, query],
  )

  const average = database.reviews.length
    ? database.reviews.reduce((sum, review) => sum + review.rating, 0) / database.reviews.length
    : 0

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteReview(pendingDelete.id)
    toast.success('ลบรีวิวแล้ว')
    setPendingDelete(null)
  }

  return (
    <>
      <AdminPageHeader
        title="จัดการรีวิว"
        description={`มีทั้งหมด ${database.reviews.length} รีวิว คะแนนเฉลี่ยรวม ${average.toFixed(1)} จาก 5`}
      />

      {database.reviews.length === 0 ? (
        <EmptyState
          icon="message"
          title="ยังไม่มีรีวิวในระบบ"
          description="รีวิวจะปรากฏที่นี่เมื่อมีผู้เข้าชมเขียนรีวิวจากหน้ารายละเอียดร้าน"
        />
      ) : (
        <>
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
                placeholder="ค้นหาชื่อผู้รีวิวหรือข้อความ"
                aria-label="ค้นหารีวิว"
                className="pl-10"
              />
            </div>
            <Select
              value={restaurantFilter}
              onChange={(event) => setRestaurantFilter(event.target.value)}
              aria-label="กรองตามร้าน"
              className="w-64"
            >
              <option value="">ทุกร้าน</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </Select>
          </div>

          {rows.length === 0 ? (
            <EmptyState title="ไม่พบรีวิวที่ตรงกับเงื่อนไข" />
          ) : (
            <ul className="space-y-3">
              {rows.map((review) => (
                <li key={review.id} className="rounded-card bg-white p-5 ring-1 ring-line/70">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{review.author}</span>
                        <Stars value={review.rating} size="sm" />
                        <span className="text-sm text-muted">
                          {formatThaiDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-brand-700">
                        {nameById.get(review.restaurantId) ?? 'ร้านถูกลบแล้ว'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      icon="trash"
                      onClick={() => setPendingDelete(review)}
                    >
                      ลบรีวิว
                    </Button>
                  </div>
                  <p className="mt-3 text-body">{review.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="ยืนยันการลบรีวิว"
        message={
          <>
            ต้องการลบรีวิวของ <strong className="text-ink">{pendingDelete?.author}</strong> ใช่หรือไม่?
            การลบไม่สามารถกู้คืนได้
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

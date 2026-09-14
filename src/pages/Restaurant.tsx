import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import { RestaurantCard } from '../components/RestaurantCard'
import { SmartImage } from '../components/SmartImage'
import { StarInput, Stars } from '../components/Stars'
import { useToast } from '../components/toast-context'
import { Badge, Button, ButtonLink, EmptyState, Field, Input, OpenBadge, SectionHeading, Textarea } from '../components/ui'
import { createReview } from '../lib/db'
import {
  DAYS,
  formatBaht,
  formatHours,
  formatPriceRange,
  formatRelative,
  mapEmbedUrl,
  mapLinkUrl,
  openStatusLabel,
  safeUrl,
  telHref,
} from '../lib/format'
import { useClockTick, useRestaurantView, useRestaurantViews } from '../lib/hooks'

export function Restaurant() {
  useClockTick()
  const { slug } = useParams()
  const restaurant = useRestaurantView(slug)
  const all = useRestaurantViews()
  const toast = useToast()

  const gallery = useMemo(() => {
    if (!restaurant) return []
    const urls = [restaurant.coverImage, ...restaurant.images.map((image) => image.url)]
    return urls.filter((url, index) => url && urls.indexOf(url) === index)
  }, [restaurant])

  const [active, setActive] = useState(0)
  const [trackedSlug, setTrackedSlug] = useState(slug)
  if (trackedSlug !== slug) {
    // Navigated to a different shop — start its gallery at the cover photo.
    setTrackedSlug(slug)
    setActive(0)
  }

  const [author, setAuthor] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState('')

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <EmptyState
          icon="store"
          title="ไม่พบร้านอาหารนี้"
          description="ร้านอาจถูกลบออกจากระบบแล้ว หรือลิงก์ไม่ถูกต้อง"
          action={<ButtonLink to="/restaurants" icon="arrowLeft">กลับไปหน้ารายการร้าน</ButtonLink>}
        />
      </div>
    )
  }

  const status = openStatusLabel(restaurant)
  const recommended = restaurant.menus.filter((menu) => menu.recommended)
  const others = restaurant.menus.filter((menu) => !menu.recommended)

  const related = all
    .filter(
      (candidate) =>
        candidate.id !== restaurant.id && candidate.categoryId === restaurant.categoryId,
    )
    .slice(0, 3)

  const socialLinks: { key: string; icon: IconName; label: string; href: string }[] = [
    { key: 'fb', icon: 'facebook', label: 'Facebook', href: safeUrl(restaurant.facebook) },
    { key: 'ig', icon: 'instagram', label: 'Instagram', href: safeUrl(restaurant.instagram) },
    { key: 'web', icon: 'globe', label: 'เว็บไซต์', href: safeUrl(restaurant.website) },
  ]
  const socials = socialLinks.filter((social) => social.href)

  const submitReview = (event: FormEvent) => {
    event.preventDefault()
    const name = author.trim()
    const text = comment.trim()
    if (!name || !text) {
      setFormError('กรุณากรอกชื่อและความคิดเห็น')
      return
    }
    if (text.length > 600) {
      setFormError('ความคิดเห็นยาวเกินไป (ไม่เกิน 600 ตัวอักษร)')
      return
    }
    createReview({ restaurantId: restaurant.id, author: name, rating, comment: text })
    setAuthor('')
    setComment('')
    setRating(5)
    setFormError('')
    toast.success('ขอบคุณสำหรับรีวิว!')
  }

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="เส้นทางนำทาง" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <Link to="/" className="transition-colors duration-200 hover:text-brand-700">
          หน้าแรก
        </Link>
        <Icon name="chevronRight" className="h-3.5 w-3.5" />
        <Link to="/restaurants" className="transition-colors duration-200 hover:text-brand-700">
          ร้านอาหาร
        </Link>
        {restaurant.category && (
          <>
            <Icon name="chevronRight" className="h-3.5 w-3.5" />
            <Link
              to={`/restaurants?category=${restaurant.category.slug}`}
              className="transition-colors duration-200 hover:text-brand-700"
            >
              {restaurant.category.name}
            </Link>
          </>
        )}
        <Icon name="chevronRight" className="h-3.5 w-3.5" />
        <span className="text-ink">{restaurant.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          {/* ------------------------------------------------ gallery */}
          <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line/70">
            <div className="aspect-[16/10] bg-brand-50">
              <SmartImage
                key={gallery[active]}
                src={gallery[active] ?? ''}
                alt={`${restaurant.name} รูปที่ ${active + 1}`}
                loading="eager"
                fallbackLabel={restaurant.name}
                className="h-full w-full object-cover"
              />
            </div>
            {gallery.length > 1 && (
              <ul className="flex gap-2 overflow-x-auto p-3 no-scrollbar">
                {gallery.map((url, index) => (
                  <li key={`${url.slice(0, 32)}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`ดูรูปที่ ${index + 1}`}
                      aria-current={index === active}
                      className={`block h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-xl ring-2 transition-colors duration-200 ${
                        index === active ? 'ring-brand-600' : 'ring-transparent hover:ring-brand-200'
                      }`}
                    >
                      <SmartImage
                        src={url}
                        alt=""
                        fallbackLabel={restaurant.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* -------------------------------------------------- header */}
          <header className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              {restaurant.category && (
                <Badge tone="brand" icon="tag">
                  {restaurant.category.name}
                </Badge>
              )}
              <OpenBadge open={status.open} label={status.label} />
              {restaurant.featured && (
                <Badge tone="gold" icon="sparkles">
                  ร้านแนะนำ
                </Badge>
              )}
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl">{restaurant.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-body">
              <span className="flex items-center gap-2">
                <Stars value={restaurant.ratingAvg} />
                <strong className="text-ink">{restaurant.ratingAvg.toFixed(1)}</strong>
                <span className="text-muted">({restaurant.reviewCount} รีวิว)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="coin" className="h-4 w-4 text-brand-400" />
                {formatPriceRange(restaurant.priceMin, restaurant.priceAvg)}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="clock" className="h-4 w-4 text-brand-400" />
                {formatHours(restaurant)}
              </span>
            </div>

            <p className="mt-5 text-[1.02rem] leading-relaxed whitespace-pre-line">
              {restaurant.description}
            </p>
          </header>

          {/* ---------------------------------------------------- menu */}
          <section className="mt-12">
            <SectionHeading
              eyebrow="Menu"
              title="เมนูอาหารแนะนำ"
              description={
                restaurant.menus.length
                  ? `มีทั้งหมด ${restaurant.menus.length} เมนูในระบบ`
                  : undefined
              }
            />
            {restaurant.menus.length === 0 ? (
              <EmptyState
                icon="utensils"
                title="ยังไม่มีเมนูสำหรับร้านนี้"
                description="ผู้ดูแลระบบสามารถเพิ่มเมนูได้จากหน้าจัดการเมนูอาหาร"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {[...recommended, ...others].map((menu) => (
                  <article
                    key={menu.id}
                    className="flex gap-4 rounded-2xl bg-white p-3 ring-1 ring-line/70 transition-shadow duration-300 hover:shadow-card"
                  >
                    <SmartImage
                      src={menu.image}
                      alt={menu.name}
                      fallbackLabel={menu.name}
                      className="h-24 w-24 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base leading-snug">{menu.name}</h3>
                        <span className="shrink-0 font-display text-lg text-brand-700">
                          {formatBaht(menu.price)}
                        </span>
                      </div>
                      {menu.recommended && (
                        <Badge tone="gold" icon="sparkles" className="mt-1.5">
                          เมนูแนะนำ
                        </Badge>
                      )}
                      {menu.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-body">{menu.description}</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ------------------------------------------------- reviews */}
          <section className="mt-12">
            <SectionHeading
              eyebrow="Reviews"
              title="รีวิวจากนักศึกษา"
              description={`คะแนนเฉลี่ย ${restaurant.ratingAvg.toFixed(1)} จาก ${restaurant.reviewCount} รีวิว`}
            />

            {restaurant.reviews.length > 0 && (
              <ul className="mb-8 space-y-4">
                {restaurant.reviews.map((review) => (
                  <li key={review.id} className="rounded-2xl bg-white p-5 ring-1 ring-line/70">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                          {review.author.trim().charAt(0) || '?'}
                        </span>
                        <span>
                          <span className="block font-semibold text-ink">{review.author}</span>
                          <span className="block text-xs text-muted">
                            {formatRelative(review.createdAt)}
                          </span>
                        </span>
                      </span>
                      <Stars value={review.rating} size="sm" />
                    </div>
                    <p className="mt-3 text-body">{review.comment}</p>
                  </li>
                ))}
              </ul>
            )}

            <form
              onSubmit={submitReview}
              className="rounded-card bg-brand-50/60 p-6 ring-1 ring-brand-100"
            >
              <h3 className="text-lg">เขียนรีวิวร้านนี้</h3>
              <p className="mt-1 mb-5 text-sm text-body">
                แชร์ประสบการณ์ให้เพื่อน ๆ ตัดสินใจง่ายขึ้น
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ชื่อของคุณ" htmlFor="review-author" required>
                  <Input
                    id="review-author"
                    value={author}
                    maxLength={60}
                    onChange={(event) => setAuthor(event.target.value)}
                    placeholder="เช่น ปอนด์ (นักศึกษาปี 2)"
                  />
                </Field>
                <div>
                  <span className="mb-1.5 block text-sm font-semibold text-ink">ให้คะแนน</span>
                  <StarInput value={rating} onChange={setRating} />
                </div>
              </div>

              <Field
                label="ความคิดเห็น"
                htmlFor="review-comment"
                required
                className="mt-4"
                error={formError}
                hint={`${comment.length}/600 ตัวอักษร`}
              >
                <Textarea
                  id="review-comment"
                  value={comment}
                  maxLength={600}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="รสชาติเป็นอย่างไร ราคาคุ้มไหม ช่วงไหนคนเยอะ…"
                />
              </Field>

              <Button type="submit" icon="send" className="mt-4">
                ส่งรีวิว
              </Button>
            </form>
          </section>
        </div>

        {/* ------------------------------------------------- sidebar */}
        <aside className="min-w-0 sm:grid sm:grid-cols-2 sm:items-start sm:gap-4 lg:block lg:sticky lg:top-28 lg:self-start">
          <div className="space-y-4 rounded-card bg-white p-6 shadow-card ring-1 ring-line/70">
            <h2 className="text-lg">ข้อมูลร้าน</h2>

            <dl className="space-y-4 text-[0.95rem]">
              <div className="flex gap-3">
                <dt className="shrink-0 text-brand-500">
                  <Icon name="clock" className="h-5 w-5" />
                  <span className="sr-only">เวลาเปิด-ปิด</span>
                </dt>
                <dd>
                  <span className="block font-semibold text-ink">{formatHours(restaurant)}</span>
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {DAYS.map((day) => {
                      const open = restaurant.openDays?.includes(day.key)
                      return (
                        <span
                          key={day.key}
                          title={day.long}
                          className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                            open ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-neutral-400'
                          }`}
                        >
                          {day.short}
                        </span>
                      )
                    })}
                  </span>
                </dd>
              </div>

              <div className="flex gap-3">
                <dt className="shrink-0 text-brand-500">
                  <Icon name="coin" className="h-5 w-5" />
                  <span className="sr-only">ราคา</span>
                </dt>
                <dd>
                  <span className="block font-semibold text-ink">
                    {formatPriceRange(restaurant.priceMin, restaurant.priceAvg)}
                  </span>
                  <span className="text-sm text-muted">ราคาโดยประมาณต่อคน</span>
                </dd>
              </div>

              {restaurant.phone && (
                <div className="flex gap-3">
                  <dt className="shrink-0 text-brand-500">
                    <Icon name="phone" className="h-5 w-5" />
                    <span className="sr-only">เบอร์โทร</span>
                  </dt>
                  <dd>
                    <a
                      href={telHref(restaurant.phone)}
                      className="font-semibold text-ink transition-colors duration-200 hover:text-brand-700"
                    >
                      {restaurant.phone}
                    </a>
                  </dd>
                </div>
              )}

              {restaurant.address && (
                <div className="flex gap-3">
                  <dt className="shrink-0 text-brand-500">
                    <Icon name="pin" className="h-5 w-5" />
                    <span className="sr-only">ที่อยู่</span>
                  </dt>
                  <dd className="text-body">{restaurant.address}</dd>
                </div>
              )}
            </dl>

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 transition-colors duration-200 hover:bg-brand-600 hover:text-white"
                  >
                    <Icon name={social.icon} className="h-4 w-4" />
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line/70 sm:mt-0 lg:mt-4">
            <iframe
              title={`แผนที่ ${restaurant.name}`}
              src={mapEmbedUrl(restaurant)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] w-full border-0 sm:aspect-[16/9] lg:aspect-[4/3]"
            />
            <div className="p-4">
              <a
                href={mapLinkUrl(restaurant)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-navy-700 px-5 py-2.5 font-semibold text-white transition-colors duration-200 hover:bg-navy-600"
              >
                <Icon name="map" className="h-4 w-4" />
                เปิดใน Google Maps
                <Icon name="external" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            eyebrow="You may also like"
            title="ร้านอื่นในหมวดเดียวกัน"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <RestaurantCard key={item.id} restaurant={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

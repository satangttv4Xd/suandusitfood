import type { DayKey, Restaurant } from './types'

export const DAYS: { key: DayKey; short: string; long: string }[] = [
  { key: 'mon', short: 'จ.', long: 'จันทร์' },
  { key: 'tue', short: 'อ.', long: 'อังคาร' },
  { key: 'wed', short: 'พ.', long: 'พุธ' },
  { key: 'thu', short: 'พฤ.', long: 'พฤหัสบดี' },
  { key: 'fri', short: 'ศ.', long: 'ศุกร์' },
  { key: 'sat', short: 'ส.', long: 'เสาร์' },
  { key: 'sun', short: 'อา.', long: 'อาทิตย์' },
]

const DAY_BY_INDEX: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export const todayKey = (now = new Date()): DayKey => DAY_BY_INDEX[now.getDay()]

export function formatBaht(amount: number): string {
  return `฿${Math.round(amount).toLocaleString('th-TH')}`
}

export function formatPriceRange(min: number, avg: number): string {
  if (!min && !avg) return 'ไม่ระบุราคา'
  if (!avg || avg <= min) return `เริ่มต้น ${formatBaht(min)}`
  return `${formatBaht(min)} – ${formatBaht(avg)}`
}

/** "07:00" → "07.00 น." — Thai convention uses a dot, not a colon. */
export function formatTime(value: string): string {
  if (!/^\d{1,2}:\d{2}$/.test(value)) return value || '—'
  return `${value.replace(':', '.')} น.`
}

export function formatHours(restaurant: Pick<Restaurant, 'openTime' | 'closeTime'>): string {
  if (!restaurant.openTime || !restaurant.closeTime) return 'ไม่ระบุเวลา'
  return `${restaurant.openTime.replace(':', '.')} – ${restaurant.closeTime.replace(':', '.')} น.`
}

export function formatOpenDays(days: DayKey[]): string {
  if (!days?.length) return 'ไม่ระบุวัน'
  if (days.length === 7) return 'เปิดทุกวัน'
  return DAYS.filter((day) => days.includes(day.key))
    .map((day) => day.short)
    .join(' ')
}

const toMinutes = (value: string): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

/**
 * Is the shop serving right now?
 *
 * `status: 'closed'` is the admin's manual override (renovation, holiday) and
 * always wins. Otherwise it is today's opening days plus the clock, with
 * closing times past midnight ("18:00 – 02:00") treated as spilling into
 * the next day.
 */
export function isOpenNow(restaurant: Restaurant, now = new Date()): boolean {
  if (restaurant.status === 'closed') return false

  const open = toMinutes(restaurant.openTime)
  const close = toMinutes(restaurant.closeTime)
  if (open === null || close === null) return false

  const minutes = now.getHours() * 60 + now.getMinutes()
  const today = todayKey(now)
  const yesterday = DAY_BY_INDEX[(now.getDay() + 6) % 7]
  const days = restaurant.openDays ?? []

  if (close > open) {
    return days.includes(today) && minutes >= open && minutes < close
  }
  // Crosses midnight: either late tonight, or the tail of yesterday's shift.
  return (
    (days.includes(today) && minutes >= open) || (days.includes(yesterday) && minutes < close)
  )
}

export function openStatusLabel(restaurant: Restaurant, now = new Date()) {
  if (restaurant.status === 'closed') {
    return { open: false, label: 'ปิดชั่วคราว' } as const
  }
  return isOpenNow(restaurant, now)
    ? ({ open: true, label: 'เปิดอยู่' } as const)
    : ({ open: false, label: 'ปิดแล้ว' } as const)
}

export function formatThaiDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatRelative(iso: string, now = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'เมื่อสักครู่'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`
  if (seconds < 86400 * 7) return `${Math.floor(seconds / 86400)} วันที่แล้ว`
  return formatThaiDate(iso)
}

/**
 * Only let a link out of the store if its scheme is one a link may use.
 *
 * React escapes text for us, but it will happily render `href="javascript:…"`,
 * and these URLs come from an admin form. This is the one XSS hole a React app
 * has to close by hand.
 */
export function safeUrl(url: string): string {
  const value = url?.trim()
  if (!value) return ''
  try {
    const parsed = new URL(value, window.location.origin)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol) ? parsed.href : ''
  } catch {
    return ''
  }
}

export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : ''
}

/**
 * Google Maps embed for a pin. The `output=embed` form needs no API key, so
 * the map works out of the box on a student laptop.
 */
export function mapEmbedUrl(restaurant: Pick<Restaurant, 'lat' | 'lng' | 'address' | 'name'>) {
  const query =
    restaurant.lat != null && restaurant.lng != null
      ? `${restaurant.lat},${restaurant.lng}`
      : `${restaurant.name} ${restaurant.address}`
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=th&z=17&output=embed`
}

export function mapLinkUrl(
  restaurant: Pick<Restaurant, 'lat' | 'lng' | 'address' | 'name' | 'mapUrl'>,
) {
  const explicit = safeUrl(restaurant.mapUrl)
  if (explicit) return explicit
  const query =
    restaurant.lat != null && restaurant.lng != null
      ? `${restaurant.lat},${restaurant.lng}`
      : `${restaurant.name} ${restaurant.address}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Case- and diacritic-insensitive contains, good enough for Thai and Latin. */
export function matches(haystack: string, needle: string): boolean {
  if (!needle) return true
  return haystack.toLocaleLowerCase('th').includes(needle.toLocaleLowerCase('th'))
}

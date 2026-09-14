import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GalleryUploader, ImageUploader } from '../../components/ImageUploader'
import { Icon } from '../../components/Icon'
import { useToast } from '../../components/toast-context'
import {
  Button,
  ButtonLink,
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
  TogglePill,
} from '../../components/ui'
import { getCsrfToken, verifyCsrfToken } from '../../lib/auth'
import {
  StorageFullError,
  createRestaurant,
  listImages,
  replaceImages,
  updateRestaurant,
} from '../../lib/db'
import { DAYS, safeUrl } from '../../lib/format'
import { useCategories, useDatabase } from '../../lib/hooks'
import type { DayKey, Restaurant, RestaurantStatus } from '../../lib/types'

interface FormState {
  name: string
  coverImage: string
  gallery: string[]
  description: string
  categoryId: string
  priceMin: string
  priceAvg: string
  rating: string
  openTime: string
  closeTime: string
  openDays: DayKey[]
  phone: string
  facebook: string
  instagram: string
  website: string
  address: string
  lat: string
  lng: string
  mapUrl: string
  status: RestaurantStatus
  featured: boolean
}

const blank: FormState = {
  name: '',
  coverImage: '',
  gallery: [],
  description: '',
  categoryId: '',
  priceMin: '',
  priceAvg: '',
  rating: '4.5',
  openTime: '08:00',
  closeTime: '18:00',
  openDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  phone: '',
  facebook: '',
  instagram: '',
  website: '',
  address: '',
  lat: '',
  lng: '',
  mapUrl: '',
  status: 'open',
  featured: false,
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-card bg-white p-6 ring-1 ring-line/70">
      <h2 className="text-lg">{title}</h2>
      {description && <p className="mt-1 mb-5 text-sm text-muted">{description}</p>}
      <div className={description ? '' : 'mt-5'}>{children}</div>
    </section>
  )
}

/** Turn a stored record into the string-shaped values the inputs expect. */
function toFormState(restaurant: Restaurant): FormState {
  return {
    name: restaurant.name,
    coverImage: restaurant.coverImage,
    gallery: listImages(restaurant.id).map((image) => image.url),
    description: restaurant.description,
    categoryId: restaurant.categoryId,
    priceMin: String(restaurant.priceMin || ''),
    priceAvg: String(restaurant.priceAvg || ''),
    rating: String(restaurant.rating ?? ''),
    openTime: restaurant.openTime,
    closeTime: restaurant.closeTime,
    openDays: restaurant.openDays ?? [],
    phone: restaurant.phone,
    facebook: restaurant.facebook,
    instagram: restaurant.instagram,
    website: restaurant.website,
    address: restaurant.address,
    lat: restaurant.lat == null ? '' : String(restaurant.lat),
    lng: restaurant.lng == null ? '' : String(restaurant.lng),
    mapUrl: restaurant.mapUrl,
    status: restaurant.status,
    featured: restaurant.featured,
  }
}

/**
 * Add and edit share one form; the URL decides which.
 *
 * The `key` remounts the editor when the id changes, which is what lets the
 * form seed itself straight from the store in `useState` — no effect, and no
 * frame where the previous shop's values are on screen.
 */
export function RestaurantForm() {
  const { id } = useParams()
  return <RestaurantEditor key={id ?? 'new'} />
}

/**
 * Numbers arrive from the DOM as strings and stay strings until save, so a
 * half-typed "1." isn't coerced to NaN while the admin is still typing.
 */
function RestaurantEditor() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()
  const categories = useCategories()
  const database = useDatabase()
  const [csrf] = useState(getCsrfToken)

  const existing = useMemo(
    () => (id ? (database.restaurants.find((row) => row.id === id) ?? null) : null),
    [database.restaurants, id],
  )

  const [form, setForm] = useState<FormState>(() => (existing ? toFormState(existing) : blank))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  if (isEdit && !existing) {
    return (
      <div className="rounded-card bg-white p-10 text-center ring-1 ring-line/70">
        <h1 className="text-2xl">ไม่พบร้านที่ต้องการแก้ไข</h1>
        <p className="mt-2 text-body">ร้านนี้อาจถูกลบไปแล้ว</p>
        <ButtonLink to="/admin/restaurants" icon="arrowLeft" className="mt-6">
          กลับไปรายการร้าน
        </ButtonLink>
      </div>
    )
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}

    if (!form.name.trim()) next.name = 'กรุณากรอกชื่อร้าน'
    else if (form.name.trim().length > 120) next.name = 'ชื่อร้านยาวเกิน 120 ตัวอักษร'

    if (!form.description.trim()) next.description = 'กรุณากรอกคำอธิบายร้าน'
    if (!form.categoryId) next.categoryId = 'กรุณาเลือกหมวดหมู่'

    const priceMin = Number(form.priceMin)
    const priceAvg = Number(form.priceAvg)
    if (form.priceMin === '' || Number.isNaN(priceMin) || priceMin < 0)
      next.priceMin = 'กรอกราคาเริ่มต้นเป็นตัวเลขไม่ติดลบ'
    if (form.priceAvg !== '' && (Number.isNaN(priceAvg) || priceAvg < 0))
      next.priceAvg = 'ราคาเฉลี่ยต้องเป็นตัวเลขไม่ติดลบ'
    else if (form.priceAvg !== '' && priceAvg < priceMin)
      next.priceAvg = 'ราคาเฉลี่ยต้องไม่น้อยกว่าราคาเริ่มต้น'

    const rating = Number(form.rating)
    if (form.rating === '' || Number.isNaN(rating) || rating < 0 || rating > 5)
      next.rating = 'คะแนนต้องอยู่ระหว่าง 0 ถึง 5'

    if (!form.openTime) next.openTime = 'กรุณาเลือกเวลาเปิด'
    if (!form.closeTime) next.closeTime = 'กรุณาเลือกเวลาปิด'
    if (form.openDays.length === 0) next.openDays = 'เลือกอย่างน้อย 1 วัน'

    if (form.lat !== '') {
      const lat = Number(form.lat)
      if (Number.isNaN(lat) || lat < -90 || lat > 90) next.lat = 'Latitude ต้องอยู่ระหว่าง -90 ถึง 90'
    }
    if (form.lng !== '') {
      const lng = Number(form.lng)
      if (Number.isNaN(lng) || lng < -180 || lng > 180)
        next.lng = 'Longitude ต้องอยู่ระหว่าง -180 ถึง 180'
    }

    ;(['facebook', 'instagram', 'website', 'mapUrl'] as const).forEach((key) => {
      if (form[key].trim() && !safeUrl(form[key])) {
        next[key] = 'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://'
      }
    })

    setErrors(next)
    if (Object.keys(next).length) {
      // Take the admin to the first thing that needs fixing.
      document
        .querySelector<HTMLElement>(`[data-field="${Object.keys(next)[0]}"]`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
    return Object.keys(next).length === 0
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!verifyCsrfToken(csrf)) {
      toast.error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
      return
    }
    if (!validate()) {
      toast.error('กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง')
      return
    }

    const payload = {
      name: form.name.trim(),
      coverImage: form.coverImage,
      description: form.description.trim(),
      categoryId: form.categoryId,
      priceMin: Number(form.priceMin),
      priceAvg: Number(form.priceAvg || form.priceMin),
      rating: Number(form.rating),
      openTime: form.openTime,
      closeTime: form.closeTime,
      openDays: form.openDays,
      phone: form.phone.trim(),
      facebook: safeUrl(form.facebook),
      instagram: safeUrl(form.instagram),
      website: safeUrl(form.website),
      address: form.address.trim(),
      lat: form.lat === '' ? null : Number(form.lat),
      lng: form.lng === '' ? null : Number(form.lng),
      mapUrl: safeUrl(form.mapUrl),
      status: form.status,
      featured: form.featured,
    }

    try {
      if (isEdit && existing) {
        updateRestaurant(existing.id, payload)
        replaceImages(
          existing.id,
          form.gallery.map((url) => ({ url })),
        )
        toast.success('บันทึกการแก้ไขเรียบร้อย')
      } else {
        const created = createRestaurant(payload)
        replaceImages(
          created.id,
          form.gallery.map((url) => ({ url })),
        )
        toast.success('เพิ่มร้านใหม่เรียบร้อย — ร้านแสดงบนหน้าเว็บไซต์แล้ว')
      }
      navigate('/admin/restaurants')
    } catch (error) {
      if (error instanceof StorageFullError) {
        toast.error('พื้นที่จัดเก็บเต็ม — ลองลดจำนวนรูปหรือสำรองข้อมูลแล้วลบร้านที่ไม่ใช้')
      } else {
        toast.error('บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      }
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <input type="hidden" name="csrf_token" value={csrf} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <ButtonLink to="/admin/restaurants" variant="ghost" size="sm" icon="arrowLeft" className="-ml-3 mb-1">
            กลับไปรายการร้าน
          </ButtonLink>
          <h1 className="text-2xl sm:text-3xl">{isEdit ? 'แก้ไขข้อมูลร้าน' : 'เพิ่มร้านอาหารใหม่'}</h1>
          <p className="mt-1.5 text-body">
            {isEdit
              ? 'แก้ไขแล้วกดบันทึก ข้อมูลบนหน้าเว็บไซต์จะอัปเดตทันที'
              : 'กรอกข้อมูลร้าน เมื่อบันทึกแล้วร้านจะแสดงบนหน้าเว็บไซต์อัตโนมัติ'}
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink to="/admin/restaurants" variant="outline">
            ยกเลิก
          </ButtonLink>
          <Button type="submit" icon="check">
            {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกร้านใหม่'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Section title="ข้อมูลพื้นฐาน">
            <div className="space-y-4">
              <Field label="ชื่อร้าน" htmlFor="name" required error={errors.name}>
                <div data-field="name">
                  <Input
                    id="name"
                    value={form.name}
                    maxLength={120}
                    onChange={(event) => set('name', event.target.value)}
                    placeholder="เช่น ครัวคุณยาย ซอยระนอง"
                  />
                </div>
              </Field>

              <Field
                label="คำอธิบายร้าน"
                htmlFor="description"
                required
                error={errors.description}
                hint="เล่าจุดเด่น บรรยากาศ หรือช่วงเวลาที่คนเยอะ เพื่อช่วยนักศึกษาตัดสินใจ"
              >
                <div data-field="description">
                  <Textarea
                    id="description"
                    value={form.description}
                    maxLength={1200}
                    rows={6}
                    onChange={(event) => set('description', event.target.value)}
                  />
                </div>
              </Field>

              <Field label="หมวดหมู่" htmlFor="category" required error={errors.categoryId}>
                <div data-field="categoryId">
                  <Select
                    id="category"
                    value={form.categoryId}
                    onChange={(event) => set('categoryId', event.target.value)}
                  >
                    <option value="">— เลือกหมวดหมู่ —</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </Field>
            </div>
          </Section>

          <Section
            title="รูปภาพร้าน"
            description="รูปหน้าปกใช้บนการ์ดและหัวหน้ารายละเอียด ส่วนรูปเพิ่มเติมจะเป็นแกลเลอรี"
          >
            <div className="space-y-6">
              <div>
                <span className="mb-1.5 block text-sm font-semibold text-ink">รูปหน้าปกร้าน</span>
                <ImageUploader
                  value={form.coverImage}
                  onChange={(value) => set('coverImage', value)}
                  label="อัปโหลดรูปหน้าปก"
                />
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-semibold text-ink">
                  รูปเพิ่มเติม (แกลเลอรี)
                </span>
                <GalleryUploader
                  value={form.gallery}
                  onChange={(value) => set('gallery', value)}
                />
              </div>
            </div>
          </Section>

          <Section title="ติดต่อและโซเชียล">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="เบอร์โทร" htmlFor="phone">
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => set('phone', event.target.value)}
                  placeholder="02-241-0111"
                />
              </Field>
              <Field label="Facebook" htmlFor="facebook" error={errors.facebook}>
                <div data-field="facebook">
                  <Input
                    id="facebook"
                    type="url"
                    value={form.facebook}
                    onChange={(event) => set('facebook', event.target.value)}
                    placeholder="https://www.facebook.com/…"
                  />
                </div>
              </Field>
              <Field label="Instagram" htmlFor="instagram" error={errors.instagram}>
                <div data-field="instagram">
                  <Input
                    id="instagram"
                    type="url"
                    value={form.instagram}
                    onChange={(event) => set('instagram', event.target.value)}
                    placeholder="https://www.instagram.com/…"
                  />
                </div>
              </Field>
              <Field label="เว็บไซต์" htmlFor="website" error={errors.website}>
                <div data-field="website">
                  <Input
                    id="website"
                    type="url"
                    value={form.website}
                    onChange={(event) => set('website', event.target.value)}
                    placeholder="https://…"
                  />
                </div>
              </Field>
            </div>
          </Section>

          <Section
            title="ที่ตั้งและแผนที่"
            description="ใส่พิกัดเพื่อให้แผนที่ปักหมุดได้แม่นยำ ถ้าไม่ใส่ระบบจะค้นหาจากชื่อร้านและที่อยู่แทน"
          >
            <div className="space-y-4">
              <Field label="ที่อยู่" htmlFor="address">
                <Textarea
                  id="address"
                  value={form.address}
                  rows={2}
                  onChange={(event) => set('address', event.target.value)}
                  placeholder="เลขที่ ถนน แขวง เขต จังหวัด รหัสไปรษณีย์"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Latitude" htmlFor="lat" error={errors.lat} hint="เช่น 13.7772">
                  <div data-field="lat">
                    <Input
                      id="lat"
                      inputMode="decimal"
                      value={form.lat}
                      onChange={(event) => set('lat', event.target.value)}
                      placeholder="13.7772"
                    />
                  </div>
                </Field>
                <Field label="Longitude" htmlFor="lng" error={errors.lng} hint="เช่น 100.5186">
                  <div data-field="lng">
                    <Input
                      id="lng"
                      inputMode="decimal"
                      value={form.lng}
                      onChange={(event) => set('lng', event.target.value)}
                      placeholder="100.5186"
                    />
                  </div>
                </Field>
              </div>
              <Field
                label="Google Maps URL"
                htmlFor="mapUrl"
                error={errors.mapUrl}
                hint="ลิงก์สำหรับปุ่มนำทาง ถ้าเว้นว่างระบบจะสร้างลิงก์จากพิกัดให้เอง"
              >
                <div data-field="mapUrl">
                  <Input
                    id="mapUrl"
                    type="url"
                    value={form.mapUrl}
                    onChange={(event) => set('mapUrl', event.target.value)}
                    placeholder="https://maps.app.goo.gl/…"
                  />
                </div>
              </Field>
            </div>
          </Section>
        </div>

        {/* ------------------------------------------------- side column */}
        <div className="space-y-6">
          <Section title="ราคาและคะแนน">
            <div className="space-y-4">
              <Field
                label="ราคาเริ่มต้น (บาท)"
                htmlFor="priceMin"
                required
                error={errors.priceMin}
              >
                <div data-field="priceMin">
                  <Input
                    id="priceMin"
                    inputMode="numeric"
                    value={form.priceMin}
                    onChange={(event) => set('priceMin', event.target.value)}
                    placeholder="40"
                  />
                </div>
              </Field>
              <Field
                label="ราคาเฉลี่ยต่อคน (บาท)"
                htmlFor="priceAvg"
                error={errors.priceAvg}
                hint="เว้นว่างได้ ระบบจะใช้ราคาเริ่มต้นแทน"
              >
                <div data-field="priceAvg">
                  <Input
                    id="priceAvg"
                    inputMode="numeric"
                    value={form.priceAvg}
                    onChange={(event) => set('priceAvg', event.target.value)}
                    placeholder="60"
                  />
                </div>
              </Field>
              <Field
                label="คะแนนเริ่มต้น (0–5)"
                htmlFor="rating"
                required
                error={errors.rating}
                hint="ใช้เมื่อยังไม่มีรีวิว เมื่อมีรีวิวแล้วหน้าเว็บจะใช้ค่าเฉลี่ยจากรีวิวจริง"
              >
                <div data-field="rating">
                  <Input
                    id="rating"
                    inputMode="decimal"
                    value={form.rating}
                    onChange={(event) => set('rating', event.target.value)}
                    placeholder="4.5"
                  />
                </div>
              </Field>
            </div>
          </Section>

          <Section title="เวลาทำการ">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="เวลาเปิด" htmlFor="openTime" required error={errors.openTime}>
                  <div data-field="openTime">
                    <Input
                      id="openTime"
                      type="time"
                      value={form.openTime}
                      onChange={(event) => set('openTime', event.target.value)}
                    />
                  </div>
                </Field>
                <Field label="เวลาปิด" htmlFor="closeTime" required error={errors.closeTime}>
                  <div data-field="closeTime">
                    <Input
                      id="closeTime"
                      type="time"
                      value={form.closeTime}
                      onChange={(event) => set('closeTime', event.target.value)}
                    />
                  </div>
                </Field>
              </div>

              <div data-field="openDays">
                <span className="mb-2 block text-sm font-semibold text-ink">
                  วันที่เปิด <span className="text-brand-600">*</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <TogglePill
                      key={day.key}
                      checked={form.openDays.includes(day.key)}
                      onChange={(checked) =>
                        set(
                          'openDays',
                          checked
                            ? [...form.openDays, day.key]
                            : form.openDays.filter((value) => value !== day.key),
                        )
                      }
                    >
                      {day.long}
                    </TogglePill>
                  ))}
                </div>
                {errors.openDays && (
                  <p className="mt-1.5 flex items-center gap-1 text-sm text-brand-700">
                    <Icon name="alert" className="h-4 w-4" />
                    {errors.openDays}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => set('openDays', DAYS.map((day) => day.key))}
                  className="mt-2 cursor-pointer text-sm font-semibold text-brand-600 transition-colors duration-200 hover:text-brand-700"
                >
                  เลือกทุกวัน
                </button>
              </div>
            </div>
          </Section>

          <Section title="การแสดงผล">
            <div className="space-y-4">
              <Field label="สถานะร้าน" htmlFor="status">
                <Select
                  id="status"
                  value={form.status}
                  onChange={(event) => set('status', event.target.value as RestaurantStatus)}
                >
                  <option value="open">เปิดให้บริการ</option>
                  <option value="closed">ปิดชั่วคราว</option>
                </Select>
              </Field>
              <p className="text-sm text-muted">
                “ปิดชั่วคราว” จะทำให้ร้านขึ้นสถานะปิดตลอดเวลา แม้จะอยู่ในช่วงเวลาทำการก็ตาม
              </p>
              <Checkbox
                label="ตั้งเป็นร้านแนะนำ (แสดงในส่วน “ร้านแนะนำ” หน้าแรก)"
                checked={form.featured}
                onChange={(event) => set('featured', event.target.checked)}
              />
            </div>
          </Section>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" icon="check" className="flex-1">
              {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกร้านใหม่'}
            </Button>
            <ButtonLink to="/admin/restaurants" variant="outline">
              ยกเลิก
            </ButtonLink>
          </div>
        </div>
      </div>
    </form>
  )
}

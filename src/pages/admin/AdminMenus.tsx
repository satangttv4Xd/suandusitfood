import { useMemo, useState, type FormEvent } from 'react'
import { Icon } from '../../components/Icon'
import { ImageUploader } from '../../components/ImageUploader'
import { ConfirmDialog, Modal } from '../../components/Modal'
import { SmartImage } from '../../components/SmartImage'
import { useToast } from '../../components/toast-context'
import {
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Field,
  Input,
  Select,
  Textarea,
} from '../../components/ui'
import { getCsrfToken, verifyCsrfToken } from '../../lib/auth'
import { StorageFullError, createMenu, deleteMenu, updateMenu } from '../../lib/db'
import { formatBaht, matches } from '../../lib/format'
import { useDatabase } from '../../lib/hooks'
import { THUMB_EDGE } from '../../lib/image'
import type { Menu } from '../../lib/types'
import { AdminPageHeader } from './AdminLayout'

interface MenuDraft {
  restaurantId: string
  name: string
  price: string
  description: string
  image: string
  recommended: boolean
}

const blank: MenuDraft = {
  restaurantId: '',
  name: '',
  price: '',
  description: '',
  image: '',
  recommended: false,
}

export function AdminMenus() {
  const database = useDatabase()
  const toast = useToast()
  const [csrf] = useState(getCsrfToken)

  const [query, setQuery] = useState('')
  const [restaurantFilter, setRestaurantFilter] = useState('')
  const [editing, setEditing] = useState<Menu | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState<MenuDraft>(blank)
  const [errors, setErrors] = useState<Partial<Record<keyof MenuDraft, string>>>({})
  const [pendingDelete, setPendingDelete] = useState<Menu | null>(null)

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
      database.menus
        .filter((menu) => {
          if (restaurantFilter && menu.restaurantId !== restaurantFilter) return false
          return matches(`${menu.name} ${menu.description}`, query.trim())
        })
        .sort(
          (a, b) =>
            (nameById.get(a.restaurantId) ?? '').localeCompare(
              nameById.get(b.restaurantId) ?? '',
              'th',
            ) ||
            Number(b.recommended) - Number(a.recommended) ||
            a.name.localeCompare(b.name, 'th'),
        ),
    [database.menus, restaurantFilter, query, nameById],
  )

  const openCreate = () => {
    setEditing(null)
    setDraft({ ...blank, restaurantId: restaurantFilter || restaurants[0]?.id || '' })
    setErrors({})
    setFormOpen(true)
  }

  const openEdit = (menu: Menu) => {
    setEditing(menu)
    setDraft({
      restaurantId: menu.restaurantId,
      name: menu.name,
      price: String(menu.price),
      description: menu.description,
      image: menu.image,
      recommended: menu.recommended,
    })
    setErrors({})
    setFormOpen(true)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!verifyCsrfToken(csrf)) {
      toast.error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
      return
    }

    const next: Partial<Record<keyof MenuDraft, string>> = {}
    if (!draft.restaurantId) next.restaurantId = 'กรุณาเลือกร้าน'
    if (!draft.name.trim()) next.name = 'กรุณากรอกชื่อเมนู'
    const price = Number(draft.price)
    if (draft.price === '' || Number.isNaN(price) || price < 0)
      next.price = 'กรอกราคาเป็นตัวเลขไม่ติดลบ'
    setErrors(next)
    if (Object.keys(next).length) return

    const payload = {
      restaurantId: draft.restaurantId,
      name: draft.name.trim(),
      price,
      description: draft.description.trim(),
      image: draft.image,
      recommended: draft.recommended,
    }

    try {
      if (editing) {
        updateMenu(editing.id, payload)
        toast.success('บันทึกการแก้ไขเมนูแล้ว')
      } else {
        createMenu(payload)
        toast.success('เพิ่มเมนูใหม่แล้ว')
      }
      setFormOpen(false)
    } catch (error) {
      toast.error(
        error instanceof StorageFullError
          ? 'พื้นที่จัดเก็บเต็ม — ลองลบรูปที่ไม่ใช้ออกก่อน'
          : 'บันทึกไม่สำเร็จ กรุณาลองใหม่',
      )
    }
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteMenu(pendingDelete.id)
    toast.success(`ลบเมนู "${pendingDelete.name}" แล้ว`)
    setPendingDelete(null)
  }

  return (
    <>
      <AdminPageHeader
        title="จัดการเมนูอาหาร"
        description={`มีทั้งหมด ${database.menus.length} เมนูใน ${restaurants.length} ร้าน`}
        action={
          <Button icon="plus" onClick={openCreate} disabled={restaurants.length === 0}>
            เพิ่มเมนูใหม่
          </Button>
        }
      />

      {restaurants.length === 0 ? (
        <EmptyState
          icon="store"
          title="ต้องมีร้านอาหารก่อนจึงจะเพิ่มเมนูได้"
          description="ไปที่หน้าจัดการร้านอาหารเพื่อเพิ่มร้านแรกของคุณ"
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
                placeholder="ค้นหาชื่อเมนู"
                aria-label="ค้นหาเมนู"
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
            <EmptyState
              icon="utensils"
              title={database.menus.length ? 'ไม่พบเมนูที่ตรงกับเงื่อนไข' : 'ยังไม่มีเมนูในระบบ'}
              description="เพิ่มเมนูแนะนำของแต่ละร้าน เพื่อให้หน้ารายละเอียดร้านมีข้อมูลครบ"
              action={<Button icon="plus" onClick={openCreate}>เพิ่มเมนูใหม่</Button>}
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((menu) => (
                <li
                  key={menu.id}
                  className="flex min-w-0 gap-4 rounded-card bg-white p-4 ring-1 ring-line/70"
                >
                  <SmartImage
                    src={menu.image}
                    alt={menu.name}
                    fallbackLabel={menu.name}
                    className="h-24 w-24 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base leading-snug">{menu.name}</h2>
                      <span className="shrink-0 font-display text-lg text-brand-700">
                        {formatBaht(menu.price)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {nameById.get(menu.restaurantId) ?? 'ร้านถูกลบแล้ว'}
                    </p>
                    {menu.recommended && (
                      <Badge tone="gold" icon="sparkles" className="mt-1.5 self-start">
                        เมนูแนะนำ
                      </Badge>
                    )}
                    <div className="mt-auto flex gap-1 pt-3">
                      <Button size="sm" variant="outline" icon="pencil" onClick={() => openEdit(menu)}>
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon="trash"
                        onClick={() => setPendingDelete(menu)}
                      >
                        ลบ
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'แก้ไขเมนูอาหาร' : 'เพิ่มเมนูอาหาร'}
        description="เมนูจะแสดงในหน้ารายละเอียดของร้านที่เลือก"
      >
        <form onSubmit={submit} noValidate className="space-y-4">
          <input type="hidden" name="csrf_token" value={csrf} />

          <Field label="ร้านที่เมนูนี้อยู่" htmlFor="menu-restaurant" required error={errors.restaurantId}>
            <Select
              id="menu-restaurant"
              value={draft.restaurantId}
              onChange={(event) => setDraft({ ...draft, restaurantId: event.target.value })}
              data-autofocus
            >
              <option value="">— เลือกร้าน —</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
            <Field label="ชื่อเมนู" htmlFor="menu-name" required error={errors.name}>
              <Input
                id="menu-name"
                value={draft.name}
                maxLength={120}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="เช่น กะเพราหมูสับไข่ดาว"
              />
            </Field>
            <Field label="ราคา (บาท)" htmlFor="menu-price" required error={errors.price}>
              <Input
                id="menu-price"
                inputMode="numeric"
                value={draft.price}
                onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                placeholder="55"
              />
            </Field>
          </div>

          <Field label="รายละเอียด" htmlFor="menu-description">
            <Textarea
              id="menu-description"
              value={draft.description}
              maxLength={400}
              rows={3}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="วัตถุดิบ ความเผ็ด หรือจุดเด่นของเมนูนี้"
            />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">รูปเมนู</span>
            <ImageUploader
              value={draft.image}
              onChange={(value) => setDraft({ ...draft, image: value })}
              label="อัปโหลดรูปเมนู"
              maxEdge={THUMB_EDGE}
              aspect="aspect-[4/3]"
            />
          </div>

          <Checkbox
            label="ตั้งเป็นเมนูแนะนำของร้านนี้"
            checked={draft.recommended}
            onChange={(event) => setDraft({ ...draft, recommended: event.target.checked })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" icon="check">
              {editing ? 'บันทึกการแก้ไข' : 'เพิ่มเมนู'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="ยืนยันการลบเมนู"
        message={
          <>
            ต้องการลบเมนู <strong className="text-ink">{pendingDelete?.name}</strong> ใช่หรือไม่?
            การลบไม่สามารถกู้คืนได้
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

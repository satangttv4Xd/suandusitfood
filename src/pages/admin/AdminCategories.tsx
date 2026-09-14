import { useMemo, useState, type FormEvent } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import { CATEGORY_ICONS } from '../../components/categoryIcons'
import { ImageUploader } from '../../components/ImageUploader'
import { ConfirmDialog, Modal } from '../../components/Modal'
import { useToast } from '../../components/toast-context'
import { Button, EmptyState, Field, Input, Textarea } from '../../components/ui'
import { getCsrfToken, verifyCsrfToken } from '../../lib/auth'
import { createCategory, deleteCategory, slugify, updateCategory } from '../../lib/db'
import { useDatabase } from '../../lib/hooks'
import { THUMB_EDGE } from '../../lib/image'
import type { Category } from '../../lib/types'
import { AdminPageHeader } from './AdminLayout'

interface CategoryDraft {
  name: string
  slug: string
  description: string
  icon: string
  image: string
  sortOrder: string
}

const blank: CategoryDraft = {
  name: '',
  slug: '',
  description: '',
  icon: 'utensils',
  image: '',
  sortOrder: '',
}

export function AdminCategories() {
  const database = useDatabase()
  const toast = useToast()
  const [csrf] = useState(getCsrfToken)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [draft, setDraft] = useState<CategoryDraft>(blank)
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryDraft, string>>>({})
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)

  const categories = useMemo(
    () => [...database.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [database.categories],
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    database.restaurants.forEach((restaurant) => {
      map.set(restaurant.categoryId, (map.get(restaurant.categoryId) ?? 0) + 1)
    })
    return map
  }, [database.restaurants])

  const openCreate = () => {
    setEditing(null)
    setDraft({ ...blank, sortOrder: String(categories.length + 1) })
    setErrors({})
    setFormOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setDraft({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon || 'utensils',
      image: category.image,
      sortOrder: String(category.sortOrder),
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

    const next: Partial<Record<keyof CategoryDraft, string>> = {}
    if (!draft.name.trim()) next.name = 'กรุณากรอกชื่อหมวดหมู่'
    const order = Number(draft.sortOrder)
    if (draft.sortOrder !== '' && (Number.isNaN(order) || order < 0))
      next.sortOrder = 'ลำดับต้องเป็นตัวเลขไม่ติดลบ'
    setErrors(next)
    if (Object.keys(next).length) return

    const payload = {
      name: draft.name.trim(),
      slug: draft.slug.trim() || slugify(draft.name),
      description: draft.description.trim(),
      icon: draft.icon,
      image: draft.image,
      sortOrder: draft.sortOrder === '' ? categories.length + 1 : order,
    }

    try {
      if (editing) {
        updateCategory(editing.id, payload)
        toast.success('บันทึกการแก้ไขหมวดหมู่แล้ว')
      } else {
        createCategory(payload)
        toast.success('เพิ่มหมวดหมู่ใหม่แล้ว')
      }
      setFormOpen(false)
    } catch {
      toast.error('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteCategory(pendingDelete.id)
    toast.success(`ลบหมวดหมู่ "${pendingDelete.name}" แล้ว`)
    setPendingDelete(null)
  }

  const affected = pendingDelete ? (counts.get(pendingDelete.id) ?? 0) : 0

  return (
    <>
      <AdminPageHeader
        title="จัดการหมวดหมู่"
        description={`มีทั้งหมด ${categories.length} หมวดหมู่`}
        action={
          <Button icon="plus" onClick={openCreate}>
            เพิ่มหมวดหมู่
          </Button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon="tag"
          title="ยังไม่มีหมวดหมู่"
          description="เพิ่มหมวดหมู่ เช่น อาหารตามสั่ง ก๋วยเตี๋ยว คาเฟ่ เพื่อจัดกลุ่มร้านให้ค้นหาง่าย"
          action={<Button icon="plus" onClick={openCreate}>เพิ่มหมวดหมู่</Button>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id} className="min-w-0 rounded-card bg-white p-5 ring-1 ring-line/70">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-50 text-brand-600">
                  {category.image ? (
                    <img src={category.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon name={(category.icon || 'utensils') as IconName} className="h-6 w-6" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base">{category.name}</h2>
                  <p className="text-sm text-muted">
                    ลำดับ {category.sortOrder} · {counts.get(category.id) ?? 0} ร้าน
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">/{category.slug}</p>
                </div>
              </div>

              {category.description && (
                <p className="mt-3 line-clamp-2 text-sm text-body">{category.description}</p>
              )}

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" icon="pencil" onClick={() => openEdit(category)}>
                  แก้ไข
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon="trash"
                  onClick={() => setPendingDelete(category)}
                >
                  ลบ
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
      >
        <form onSubmit={submit} noValidate className="space-y-4">
          <input type="hidden" name="csrf_token" value={csrf} />

          <Field label="ชื่อหมวดหมู่" htmlFor="cat-name" required error={errors.name}>
            <Input
              id="cat-name"
              value={draft.name}
              maxLength={80}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="เช่น อาหารตามสั่ง"
              data-autofocus
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr]">
            <Field
              label="Slug (ใช้ใน URL)"
              htmlFor="cat-slug"
              hint="เว้นว่างได้ ระบบจะสร้างให้อัตโนมัติ"
            >
              <Input
                id="cat-slug"
                value={draft.slug}
                onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
                placeholder="tam-sang"
              />
            </Field>
            <Field label="ลำดับการแสดง" htmlFor="cat-order" error={errors.sortOrder}>
              <Input
                id="cat-order"
                inputMode="numeric"
                value={draft.sortOrder}
                onChange={(event) => setDraft({ ...draft, sortOrder: event.target.value })}
              />
            </Field>
          </div>

          <Field label="คำอธิบาย" htmlFor="cat-description">
            <Textarea
              id="cat-description"
              value={draft.description}
              maxLength={200}
              rows={2}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="อธิบายสั้น ๆ ว่าหมวดนี้รวมร้านแบบไหน"
            />
          </Field>

          <div>
            <span className="mb-2 block text-sm font-semibold text-ink">ไอคอนประจำหมวด</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map((icon) => (
                <label
                  key={icon}
                  className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl ring-1 transition-colors duration-200 ${
                    draft.icon === icon && !draft.image
                      ? 'bg-brand-600 text-white ring-brand-600'
                      : 'bg-white text-body ring-line hover:bg-brand-50 hover:text-brand-700'
                  }`}
                  title={icon}
                >
                  <input
                    type="radio"
                    name="category-icon"
                    value={icon}
                    checked={draft.icon === icon}
                    onChange={() => setDraft({ ...draft, icon })}
                    className="sr-only"
                  />
                  <Icon name={icon} className="h-5 w-5" />
                  <span className="sr-only">{icon}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              หรืออัปโหลดรูปไอคอนเอง
            </span>
            <p className="mb-2 text-sm text-muted">ถ้าอัปโหลดรูป ระบบจะใช้รูปนี้แทนไอคอนด้านบน</p>
            <ImageUploader
              value={draft.image}
              onChange={(value) => setDraft({ ...draft, image: value })}
              label="อัปโหลดรูปไอคอน"
              maxEdge={THUMB_EDGE}
              aspect="aspect-square"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" icon="check">
              {editing ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="ยืนยันการลบหมวดหมู่"
        message={
          <>
            ต้องการลบหมวดหมู่ <strong className="text-ink">{pendingDelete?.name}</strong> ใช่หรือไม่?
            {affected > 0 && (
              <>
                <br />
                <span className="text-brand-700">
                  มี {affected} ร้านอยู่ในหมวดนี้ — ร้านจะไม่ถูกลบ แต่จะกลายเป็น “ไม่ระบุหมวดหมู่”
                  จนกว่าจะเลือกหมวดใหม่ให้
                </span>
              </>
            )}
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

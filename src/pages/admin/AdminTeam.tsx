import { useMemo, useState, type FormEvent } from 'react'
import { Icon } from '../../components/Icon'
import { ImageUploader } from '../../components/ImageUploader'
import { ConfirmDialog, Modal } from '../../components/Modal'
import { SmartImage } from '../../components/SmartImage'
import { useToast } from '../../components/toast-context'
import { Badge, Button, EmptyState, Field, Input, Textarea } from '../../components/ui'
import { getCsrfToken, verifyCsrfToken } from '../../lib/auth'
import {
  StorageFullError,
  createTeamMember,
  deleteTeamMember,
  updateTeamMember,
} from '../../lib/db'
import { matches } from '../../lib/format'
import { useTeamMembers } from '../../lib/hooks'
import { THUMB_EDGE } from '../../lib/image'
import type { TeamMember } from '../../lib/types'
import { AdminPageHeader } from './AdminLayout'

interface MemberDraft {
  name: string
  studentId: string
  role: string
  faculty: string
  image: string
  bio: string
  sortOrder: string
}

const blank: MemberDraft = {
  name: '',
  studentId: '',
  role: '',
  faculty: '',
  image: '',
  bio: '',
  sortOrder: '0',
}

export function AdminTeam() {
  const members = useTeamMembers()
  const toast = useToast()
  const [csrf] = useState(getCsrfToken)

  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState<MemberDraft>(blank)
  const [errors, setErrors] = useState<Partial<Record<keyof MemberDraft, string>>>({})
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null)

  const rows = useMemo(() => {
    return members.filter((member) =>
      matches(`${member.name} ${member.studentId} ${member.role} ${member.faculty}`, query.trim()),
    )
  }, [members, query])

  const openCreate = () => {
    setEditing(null)
    setDraft({ ...blank, sortOrder: String(members.length + 1) })
    setErrors({})
    setFormOpen(true)
  }

  const openEdit = (member: TeamMember) => {
    setEditing(member)
    setDraft({
      name: member.name,
      studentId: member.studentId,
      role: member.role,
      faculty: member.faculty,
      image: member.image,
      bio: member.bio,
      sortOrder: String(member.sortOrder),
    })
    setErrors({})
    setFormOpen(true)
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof MemberDraft, string>> = {}
    if (!draft.name.trim()) next.name = 'กรุณากรอกชื่อ-นามสกุล'
    if (!draft.role.trim()) next.role = 'กรุณากรอกบทบาทหรือหน้าที่'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!verifyCsrfToken(csrf)) {
      toast.error('เซสชันหมดอายุ กรุณารีเฟรชหน้าเว็บ')
      return
    }
    if (!validate()) return

    const payload = {
      name: draft.name.trim(),
      studentId: draft.studentId.trim(),
      role: draft.role.trim(),
      faculty: draft.faculty.trim(),
      image: draft.image,
      bio: draft.bio.trim(),
      sortOrder: Number(draft.sortOrder) || 0,
    }

    try {
      if (editing) {
        updateTeamMember(editing.id, payload)
        toast.success(`บันทึกข้อมูล “${payload.name}” เรียบร้อยแล้ว`)
      } else {
        createTeamMember(payload)
        toast.success(`เพิ่มสมาชิก “${payload.name}” เรียบร้อยแล้ว`)
      }
      setFormOpen(false)
    } catch (error) {
      if (error instanceof StorageFullError) {
        toast.error('พื้นที่จัดเก็บข้อมูลเต็ม ลองลดขนาดรูปภาพ')
      } else {
        toast.error('ไม่สามารถบันทึกข้อมูลได้')
      }
    }
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteTeamMember(pendingDelete.id)
    toast.info(`ลบสมาชิก “${pendingDelete.name}” เรียบร้อยแล้ว`)
    setPendingDelete(null)
  }

  return (
    <>
      <AdminPageHeader
        title="สมาชิกผู้จัดทำ"
        description="จัดการรายชื่อ รหัสนักศึกษา คณะ บทบาท และรูปถ่ายของผู้จัดทำโครงงาน"
        action={
          <Button icon="plus" onClick={openCreate}>
            เพิ่มสมาชิก
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่อ รหัส คณะ หรือบทบาท…"
            aria-label="ค้นหาสมาชิก"
          />
        </div>
        <p className="text-sm text-muted">
          แสดง {rows.length} จาก {members.length} สมาชิก
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="users"
          title={members.length ? 'ไม่พบสมาชิกที่ตรงกับเงื่อนไข' : 'ยังไม่มีสมาชิกผู้จัดทำในระบบ'}
          description="กดปุ่มเพิ่มสมาชิก เพื่อใส่รายชื่อผู้จัดทำโครงงานวิชาพลังสวนดุสิต"
          action={
            <Button icon="plus" onClick={openCreate}>
              เพิ่มสมาชิกคนแรก
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((member) => (
            <div
              key={member.id}
              className="flex min-w-0 flex-col overflow-hidden rounded-card bg-white ring-1 ring-line/80 shadow-xs"
            >
              <div className="flex gap-4 p-4">
                {member.image ? (
                  <SmartImage
                    src={member.image}
                    alt={member.name}
                    fallbackLabel={member.name}
                    className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon name="user" className="h-10 w-10" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1">
                    <h2 className="truncate font-bold text-ink">{member.name}</h2>
                    <span className="shrink-0 text-xs font-mono text-muted">
                      #{member.sortOrder}
                    </span>
                  </div>
                  {member.role && (
                    <p className="mt-0.5 truncate text-sm font-semibold text-brand-600">
                      {member.role}
                    </p>
                  )}
                  {member.studentId && (
                    <Badge tone="brand" className="mt-1 font-mono text-[0.7rem]">
                      {member.studentId}
                    </Badge>
                  )}
                  {member.faculty && (
                    <p className="mt-1 truncate text-xs text-muted">
                      {member.faculty}
                    </p>
                  )}
                </div>
              </div>

              {member.bio && (
                <p className="px-4 pb-3 text-xs leading-relaxed text-body border-t border-line/50 pt-2 line-clamp-2">
                  {member.bio}
                </p>
              )}

              <div className="mt-auto flex items-center justify-end gap-2 border-t border-line/60 bg-cream/40 px-4 py-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  icon="pencil"
                  onClick={() => openEdit(member)}
                >
                  แก้ไข
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon="trash"
                  onClick={() => setPendingDelete(member)}
                >
                  ลบ
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- Form Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `แก้ไขข้อมูล: ${editing.name}` : 'เพิ่มสมาชิกผู้จัดทำใหม่'}
      >
        <form onSubmit={submit} className="space-y-4">
          <input type="hidden" name="csrf_token" value={csrf} />

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ชื่อ-นามสกุล" htmlFor="member-name" required error={errors.name}>
              <Input
                id="member-name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="เช่น นายกิตติศักดิ์ พัฒนกิจ"
                autoFocus
              />
            </Field>

            <Field label="รหัสนักศึกษา" htmlFor="member-student-id">
              <Input
                id="member-student-id"
                value={draft.studentId}
                onChange={(event) => setDraft({ ...draft, studentId: event.target.value })}
                placeholder="เช่น 6611011340001"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="บทบาท / หน้าที่" htmlFor="member-role" required error={errors.role}>
              <Input
                id="member-role"
                value={draft.role}
                onChange={(event) => setDraft({ ...draft, role: event.target.value })}
                placeholder="เช่น หัวหน้าโครงการ / พัฒนาเว็บไซต์"
              />
            </Field>

            <Field label="คณะ / สาขาวิชา" htmlFor="member-faculty">
              <Input
                id="member-faculty"
                value={draft.faculty}
                onChange={(event) => setDraft({ ...draft, faculty: event.target.value })}
                placeholder="เช่น คณะวิทยาศาสตร์และเทคโนโลยี"
              />
            </Field>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">รูปถ่ายสมาชิก</span>
            <ImageUploader
              value={draft.image}
              onChange={(value) => setDraft({ ...draft, image: value })}
              label="อัปโหลดรูปสมาชิก"
              maxEdge={THUMB_EDGE}
              aspect="aspect-[4/3]"
            />
          </div>

          <Field label="รายละเอียด / ช่องทางติดต่อ" htmlFor="member-bio">
            <Textarea
              id="member-bio"
              value={draft.bio}
              maxLength={400}
              rows={3}
              onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
              placeholder="ความรับผิดชอบเพิ่มเติม หรือช่องทางติดต่อ เช่น IG / อีเมล"
            />
          </Field>

          <Field label="ลำดับการแสดงผล" htmlFor="member-sort-order">
            <Input
              id="member-sort-order"
              type="number"
              min="0"
              value={draft.sortOrder}
              onChange={(event) => setDraft({ ...draft, sortOrder: event.target.value })}
              placeholder="1"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" icon="check">
              {editing ? 'บันทึกการแก้ไข' : 'เพิ่มสมาชิก'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------ Confirm Delete */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="ยืนยันการลบสมาชิก"
        message={
          <>
            ต้องการลบสมาชิก <strong>“{pendingDelete?.name}”</strong> ใช่หรือไม่?
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </>
        }
        confirmLabel="ลบสมาชิก"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

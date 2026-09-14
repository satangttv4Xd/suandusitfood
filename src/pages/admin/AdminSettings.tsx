import { useRef, useState, type FormEvent } from 'react'
import { Icon } from '../../components/Icon'
import { ConfirmDialog } from '../../components/Modal'
import { useToast } from '../../components/toast-context'
import { Button, Field, Input } from '../../components/ui'
import { changePassword, getCsrfToken, verifyCsrfToken } from '../../lib/auth'
import {
  clearContent,
  exportDatabase,
  getStorageUsage,
  importDatabase,
  resetToSeed,
} from '../../lib/db'
import { formatBytes } from '../../lib/image'
import { useDatabase, useSessionState } from '../../lib/hooks'
import { AdminPageHeader } from './AdminLayout'

type PendingAction = 'reset' | 'clear' | null

export function AdminSettings() {
  const database = useDatabase()
  const session = useSessionState()
  const toast = useToast()
  const [csrf] = useState(getCsrfToken)
  const fileInput = useRef<HTMLInputElement>(null)

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<PendingAction>(null)

  const storage = getStorageUsage()

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault()
    if (!session) return
    if (!verifyCsrfToken(csrf)) {
      setPasswordError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
      return
    }
    if (next !== confirm) {
      setPasswordError('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน')
      return
    }
    setBusy(true)
    const result = await changePassword(session.userId, current, next)
    setBusy(false)
    if (result.ok) {
      setCurrent('')
      setNext('')
      setConfirm('')
      setPasswordError('')
      toast.success('เปลี่ยนรหัสผ่านเรียบร้อย')
    } else {
      setPasswordError(result.error)
    }
  }

  const download = () => {
    const blob = new Blob([exportDatabase()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `suandusitfood-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('ดาวน์โหลดไฟล์สำรองข้อมูลแล้ว')
  }

  const upload = async (file: File | undefined) => {
    if (!file) return
    try {
      importDatabase(await file.text())
      toast.success('กู้คืนข้อมูลจากไฟล์สำรองเรียบร้อย')
    } catch {
      toast.error('ไฟล์ไม่ถูกต้อง — ต้องเป็นไฟล์ JSON ที่ส่งออกจากระบบนี้')
    }
  }

  const runPending = () => {
    if (pending === 'reset') {
      resetToSeed()
      toast.success('คืนค่าข้อมูลตัวอย่างเรียบร้อย')
    } else if (pending === 'clear') {
      clearContent()
      toast.success('ลบข้อมูลร้านทั้งหมดแล้ว')
    }
    setPending(null)
  }

  return (
    <>
      <AdminPageHeader
        title="ตั้งค่าข้อมูล"
        description="จัดการบัญชีผู้ดูแล สำรองข้อมูล และคืนค่าข้อมูลตัวอย่าง"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ------------------------------------------------- password */}
        <section className="rounded-card bg-white p-5 ring-1 ring-line/70 sm:p-6">
          <h2 className="text-lg">เปลี่ยนรหัสผ่าน</h2>
          <p className="mt-1 mb-5 text-sm text-muted">
            บัญชีปัจจุบัน: <strong className="text-ink">{session?.username}</strong> —
            รหัสผ่านถูกเก็บเป็นค่าแฮช PBKDF2 ไม่ได้เก็บเป็นข้อความธรรมดา
          </p>

          <form onSubmit={submitPassword} noValidate className="space-y-4">
            <input type="hidden" name="csrf_token" value={csrf} />
            <Field label="รหัสผ่านปัจจุบัน" htmlFor="current-password" required>
              <Input
                id="current-password"
                type="password"
                value={current}
                autoComplete="current-password"
                onChange={(event) => setCurrent(event.target.value)}
              />
            </Field>
            <Field
              label="รหัสผ่านใหม่"
              htmlFor="new-password"
              required
              hint="อย่างน้อย 8 ตัวอักษร"
            >
              <Input
                id="new-password"
                type="password"
                value={next}
                autoComplete="new-password"
                onChange={(event) => setNext(event.target.value)}
              />
            </Field>
            <Field
              label="ยืนยันรหัสผ่านใหม่"
              htmlFor="confirm-password"
              required
              error={passwordError}
            >
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                autoComplete="new-password"
                onChange={(event) => setConfirm(event.target.value)}
              />
            </Field>
            <Button type="submit" icon="lock" disabled={busy}>
              {busy ? 'กำลังบันทึก…' : 'เปลี่ยนรหัสผ่าน'}
            </Button>
          </form>
        </section>

        {/* --------------------------------------------------- backup */}
        <section className="rounded-card bg-white p-5 ring-1 ring-line/70 sm:p-6">
          <h2 className="text-lg">สำรองและกู้คืนข้อมูล</h2>
          <p className="mt-1 mb-5 text-sm text-muted">
            ข้อมูลถูกเก็บใน localStorage ของเบราว์เซอร์นี้เท่านั้น
            ควรดาวน์โหลดไฟล์สำรองไว้เป็นระยะ โดยเฉพาะก่อนล้างข้อมูลเบราว์เซอร์
          </p>

          <dl className="mb-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {[
              { label: 'ร้านอาหาร', value: database.restaurants.length },
              { label: 'หมวดหมู่', value: database.categories.length },
              { label: 'เมนู', value: database.menus.length },
              { label: 'รูปแกลเลอรี', value: database.restaurantImages.length },
              { label: 'รีวิว', value: database.reviews.length },
              { label: 'ขนาดข้อมูล', value: formatBytes(storage.bytes) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-neutral-50 p-3">
                <dt className="text-xs text-muted">{item.label}</dt>
                <dd className="font-semibold text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button icon="download" onClick={download}>
              ดาวน์โหลดไฟล์สำรอง
            </Button>
            <Button variant="outline" icon="upload" onClick={() => fileInput.current?.click()}>
              กู้คืนจากไฟล์
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => {
                void upload(event.target.files?.[0])
                event.target.value = ''
              }}
            />
          </div>
        </section>

        {/* ------------------------------------------------- danger zone */}
        <section className="rounded-card bg-white p-5 ring-1 ring-brand-100 sm:p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-lg">
            <Icon name="alert" className="h-5 w-5 text-brand-600" />
            พื้นที่อันตราย
          </h2>
          <p className="mt-1 mb-5 text-sm text-muted">
            สองปุ่มนี้เขียนทับข้อมูลทั้งหมดในเครื่องนี้ ควรดาวน์โหลดไฟล์สำรองก่อนทุกครั้ง
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-neutral-50 p-5">
              <h3 className="text-base">คืนค่าข้อมูลตัวอย่าง</h3>
              <p className="mt-1.5 mb-4 text-sm text-body">
                ลบข้อมูลปัจจุบันทั้งหมดแล้วใส่ร้านตัวอย่าง 5 ร้านกลับเข้าไป
                บัญชีผู้ดูแลและรหัสผ่านจะไม่ถูกแตะต้อง
              </p>
              <Button variant="outline" icon="refresh" onClick={() => setPending('reset')}>
                คืนค่าข้อมูลตัวอย่าง
              </Button>
            </div>

            <div className="rounded-2xl bg-brand-50 p-5">
              <h3 className="text-base">ล้างข้อมูลร้านทั้งหมด</h3>
              <p className="mt-1.5 mb-4 text-sm text-body">
                ลบร้าน หมวดหมู่ เมนู รูปภาพ และรีวิวทั้งหมด เหลือเพียงระบบเปล่า ๆ
                สำหรับเริ่มกรอกข้อมูลจริง
              </p>
              <Button variant="danger" icon="trash" onClick={() => setPending('clear')}>
                ล้างข้อมูลทั้งหมด
              </Button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={pending === 'reset' ? 'คืนค่าข้อมูลตัวอย่าง' : 'ล้างข้อมูลทั้งหมด'}
        confirmLabel={pending === 'reset' ? 'คืนค่าข้อมูล' : 'ล้างข้อมูล'}
        message={
          pending === 'reset' ? (
            <>
              ข้อมูลร้าน หมวดหมู่ เมนู และรีวิวที่มีอยู่ตอนนี้ทั้งหมด
              จะถูกแทนที่ด้วยข้อมูลตัวอย่างชุดเดิม และไม่สามารถกู้คืนได้
            </>
          ) : (
            <>
              ข้อมูลร้าน {database.restaurants.length} ร้าน, เมนู {database.menus.length} รายการ,
              หมวดหมู่ {database.categories.length} หมวด และรีวิว {database.reviews.length} รายการ
              จะถูกลบทั้งหมด และไม่สามารถกู้คืนได้
            </>
          )
        }
        onConfirm={runPending}
        onCancel={() => setPending(null)}
      />
    </>
  )
}

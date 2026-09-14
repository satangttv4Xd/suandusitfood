import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Button, Field, Input } from '../../components/ui'
import { DEFAULT_ADMIN, getCsrfToken, login, verifyCsrfToken } from '../../lib/auth'
import { useSessionState } from '../../lib/hooks'

export function Login() {
  const session = useSessionState()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [csrf] = useState(getCsrfToken)

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname

  if (session) return <Navigate to={from ?? '/admin'} replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!verifyCsrfToken(csrf)) {
      setError('เซสชันหมดอายุ กรุณารีเฟรชหน้านี้แล้วลองใหม่')
      return
    }
    setBusy(true)
    const result = await login(username, password)
    setBusy(false)
    if (result.ok) {
      navigate(from ?? '/admin', { replace: true })
    } else {
      setError(result.error)
      setPassword('')
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel — hidden on small screens where it would just push the form down. */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-800 p-12 text-white lg:flex">
        <div
          className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-gold-600/20 blur-3xl"
          aria-hidden="true"
        />

        <Link to="/" className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600">
            <Icon name="utensils" className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="block font-display tracking-[0.06em] text-white">SUAN DUSIT</span>
            <span className="block text-xs font-bold tracking-[0.28em] text-brand-300 uppercase">
              Food Guide
            </span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <h1 className="text-4xl text-white">ระบบจัดการข้อมูลร้านอาหาร</h1>
          <p className="mt-4 text-navy-100">
            เพิ่ม แก้ไข และลบข้อมูลร้าน เมนู รูปภาพ และหมวดหมู่ได้เองทั้งหมด
            การเปลี่ยนแปลงจะแสดงบนหน้าเว็บไซต์ทันทีโดยไม่ต้องแก้โค้ด
          </p>
          <ul className="mt-8 space-y-3 text-navy-100">
            {[
              'จัดการร้านอาหารพร้อมรูปหน้าปกและแกลเลอรี',
              'เพิ่มเมนูและราคาแยกตามร้าน',
              'สำรองและกู้คืนข้อมูลเป็นไฟล์ JSON',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-gold-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-navy-100/70">
          เว็บไซต์โครงงานเพื่อการศึกษา — ไม่ใช่ระบบทางการของมหาวิทยาลัย
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-cream px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors duration-200 hover:text-brand-700"
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
            กลับไปหน้าเว็บไซต์
          </Link>

          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Icon name="lock" className="h-6 w-6" />
          </span>
          <h2 className="mt-5 text-2xl">เข้าสู่ระบบผู้ดูแล</h2>
          <p className="mt-1.5 text-body">กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าสู่ Dashboard</p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <input type="hidden" name="csrf_token" value={csrf} />

            <Field label="ชื่อผู้ใช้" htmlFor="username" required>
              <Input
                id="username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </Field>

            <Field label="รหัสผ่าน" htmlFor="password" required error={error}>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-lg p-2 text-muted transition-colors duration-200 hover:bg-neutral-100 hover:text-ink"
                >
                  <Icon name="eye" className="h-4 w-4" />
                </button>
              </div>
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={busy} icon="lock">
              {busy ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <div className="mt-8 rounded-2xl bg-gold-300/20 p-4 ring-1 ring-gold-300/50">
            <p className="flex items-center gap-2 text-sm font-semibold text-gold-700">
              <Icon name="info" className="h-4 w-4" />
              บัญชีเริ่มต้นสำหรับทดสอบ
            </p>
            <p className="mt-1.5 text-sm text-body">
              ชื่อผู้ใช้ <code className="rounded bg-white px-1.5 py-0.5 font-mono">{DEFAULT_ADMIN.username}</code>{' '}
              รหัสผ่าน <code className="rounded bg-white px-1.5 py-0.5 font-mono">{DEFAULT_ADMIN.password}</code>
            </p>
            <p className="mt-1.5 text-xs text-muted">
              เปลี่ยนรหัสผ่านได้ที่เมนู “ตั้งค่าข้อมูล” หลังเข้าสู่ระบบ
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../../components/Icon'
import { logout } from '../../lib/auth'
import { useDismissOnChange, useScrollLock, useSessionState } from '../../lib/hooks'

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'ภาพรวม', icon: 'dashboard', end: true },
  { to: '/admin/restaurants', label: 'ร้านอาหาร', icon: 'store' },
  { to: '/admin/menus', label: 'เมนูอาหาร', icon: 'utensils' },
  { to: '/admin/reviews', label: 'รีวิว', icon: 'message' },
  { to: '/admin/settings', label: 'ตั้งค่าข้อมูล', icon: 'settings' },
]

/**
 * Gate in front of every /admin route.
 *
 * With no session the user is bounced to the login screen, and the page they
 * were reaching for rides along in router state so login can return them there.
 */
export function RequireAuth() {
  const session = useSessionState()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  return <Outlet />
}

export function AdminLayout() {
  const session = useSessionState()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useDismissOnChange(location.pathname)
  useScrollLock(menuOpen)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-semibold transition-colors duration-200 ${
      isActive
        ? 'bg-brand-600 text-white'
        : 'text-navy-100/90 hover:bg-white/10 hover:text-white'
    }`

  const sidebar = (
    <>
      <Link to="/admin" className="flex items-center gap-2.5 px-2 py-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Icon name="utensils" className="h-5 w-5" />
        </span>
        <span className="leading-none">
          <span className="block font-display text-sm tracking-[0.06em] text-white">
            SUAN DUSIT
          </span>
          <span className="block text-[0.68rem] font-bold tracking-[0.24em] text-brand-300 uppercase">
            Admin Panel
          </span>
        </span>
      </Link>

      <nav aria-label="เมนูผู้ดูแลระบบ" className="mt-7 flex-1">
        <ul className="space-y-1">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className={linkClass}>
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 space-y-1 border-t border-white/10 pt-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-semibold text-navy-100/90 transition-colors duration-200 hover:bg-white/10 hover:text-white"
        >
          <Icon name="eye" className="h-5 w-5 shrink-0" />
          ดูเว็บไซต์
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 font-semibold text-navy-100/90 transition-colors duration-200 hover:bg-brand-600 hover:text-white"
        >
          <Icon name="logout" className="h-5 w-5 shrink-0" />
          ออกจากระบบ
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-svh bg-neutral-50">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-navy-800 p-4 lg:flex">
        {sidebar}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/50"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] animate-fade flex-col bg-navy-800 p-4">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-60 flex items-center gap-3 border-b border-line bg-white/92 px-4 py-3 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="เปิดเมนูผู้ดูแลระบบ"
            className="cursor-pointer rounded-xl p-2 text-ink transition-colors duration-200 hover:bg-brand-50 lg:hidden"
          >
            <Icon name="menu" className="h-5 w-5" />
          </button>

          <p className="hidden text-sm font-semibold text-muted sm:block">
            ระบบจัดการข้อมูลร้านอาหาร
          </p>

          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-body transition-colors duration-200 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex"
            >
              <Icon name="external" className="h-4 w-4" />
              เปิดหน้าเว็บไซต์
            </Link>
            <span className="flex items-center gap-2 rounded-full bg-neutral-100 p-1.5 sm:pr-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
                {session?.displayName?.charAt(0) ?? 'A'}
              </span>
              <span className="hidden text-sm font-semibold whitespace-nowrap text-ink sm:block">
                {session?.displayName ?? 'ผู้ดูแลระบบ'}
              </span>
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** Shared page header for the admin screens. */
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-body">{description}</p>}
      </div>
      {action}
    </div>
  )
}

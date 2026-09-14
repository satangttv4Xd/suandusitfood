import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useDismissOnChange, useScrollLock } from '../lib/hooks'
import { Icon } from './Icon'

const NAV = [
  { to: '/', label: 'หน้าแรก', end: true },
  { to: '/restaurants', label: 'ร้านอาหาร', end: false },
  { to: '/categories', label: 'หมวดหมู่', end: false },
  { to: '/map', label: 'แผนที่', end: false },
  { to: '/about', label: 'เกี่ยวกับเรา', end: false },
]

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex shrink-0 items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors duration-200 group-hover:bg-brand-700">
        <Icon name="utensils" className="h-5 w-5" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[0.95rem] tracking-[0.06em] text-ink">
          SUAN DUSIT
        </span>
        <span className="block text-[0.7rem] font-bold tracking-[0.28em] text-brand-600 uppercase">
          Food Guide
        </span>
      </span>
      {!compact && <span className="sr-only">แนะนำร้านอาหารรอบมหาวิทยาลัยสวนดุสิต</span>}
    </Link>
  )
}

function Navbar() {
  const location = useLocation()
  const [open, setOpen] = useDismissOnChange(`${location.pathname}${location.search}`)
  const [scrolled, setScrolled] = useState(false)
  useScrollLock(open)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-2 text-[0.95rem] font-semibold transition-colors duration-200 lg:px-4 ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-body hover:bg-brand-50/70 hover:text-brand-700'
    }`

  return (
    <header className="sticky top-0 z-70 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav
        aria-label="เมนูหลัก"
        className={`mx-auto flex max-w-7xl items-center gap-3 rounded-2xl px-4 py-2.5 transition-shadow duration-300 sm:px-5 ${
          scrolled
            ? 'bg-white/92 shadow-lift ring-1 ring-line/80 backdrop-blur-md'
            : 'bg-white/80 ring-1 ring-line/60 backdrop-blur'
        }`}
      >
        <Wordmark />

        <div className="ml-auto hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
          className="ml-auto cursor-pointer rounded-xl p-2.5 text-ink transition-colors duration-200 hover:bg-brand-50 md:hidden"
        >
          <Icon name={open ? 'close' : 'menu'} className="h-5 w-5" />
        </button>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          className="mx-auto mt-2 max-w-7xl animate-rise rounded-2xl bg-white p-3 shadow-lift ring-1 ring-line md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 font-semibold transition-colors duration-200 ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-body hover:bg-brand-50/70'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-24 bg-navy-800 text-navy-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Icon name="utensils" className="h-5 w-5" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[0.95rem] tracking-[0.06em] text-white">
                SUAN DUSIT
              </span>
              <span className="block text-[0.7rem] font-bold tracking-[0.28em] text-brand-300 uppercase">
                Food Guide
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-100/90">
            คู่มือร้านอาหารภายในและรอบมหาวิทยาลัยสวนดุสิต รวมร้านอร่อยราคานักศึกษา
            พร้อมเมนูแนะนำ เวลาเปิด-ปิด และแผนที่ อัปเดตโดยทีมผู้ดูแลระบบ
          </p>
          <p className="mt-4 text-sm text-navy-100/75">
            เป็นเว็บไซต์โครงงานเพื่อการศึกษา ไม่ใช่เว็บไซต์ทางการของมหาวิทยาลัย
          </p>
        </div>

        <nav aria-label="ลิงก์ในเว็บไซต์">
          <h2 className="mb-4 text-sm font-bold tracking-[0.18em] text-white uppercase">
            เมนู
          </h2>
          <ul className="space-y-1 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="inline-block py-1.5 text-navy-100/90 transition-colors duration-200 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-bold tracking-[0.18em] text-white uppercase">
            ติดต่อ
          </h2>
          <ul className="space-y-2.5 text-sm text-navy-100/90">
            <li className="flex items-start gap-2">
              <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
              295 ถนนนครราชสีมา เขตดุสิต กรุงเทพมหานคร 10300
            </li>
            <li className="flex items-center gap-2">
              <Icon name="globe" className="h-4 w-4 shrink-0 text-brand-300" />
              <a
                href="https://www.dusit.ac.th"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block py-1.5 transition-colors duration-200 hover:text-white"
              >
                dusit.ac.th
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-navy-100/75 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Suan Dusit Food Guide — จัดทำเพื่อการศึกษา
        </p>
      </div>
    </footer>
  )
}

/** Shell for every public page: skip link, navbar, routed content, footer. */
export function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only rounded-full bg-brand-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-200"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

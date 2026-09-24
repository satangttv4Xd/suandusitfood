import { Icon, type IconName } from '../components/Icon'
import { ButtonLink } from '../components/ui'
import { useCategories, useRestaurantViews } from '../lib/hooks'

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'search',
    title: 'ค้นหา',
    body: 'พิมพ์ชื่อร้าน ชื่อเมนู หรือประเภทอาหารในช่องค้นหา ระบบจะค้นทั้งชื่อร้านและรายการเมนูให้พร้อมกัน',
  },
  {
    icon: 'filter',
    title: 'กรอง',
    body: 'เลือกหมวดหมู่ ช่วงราคา หรือกรองเฉพาะร้านที่เปิดอยู่ตอนนี้ เงื่อนไขทั้งหมดถูกเก็บไว้ใน URL แชร์ให้เพื่อนได้เลย',
  },
  {
    icon: 'map',
    title: 'ไปให้ถูก',
    body: 'ดูตำแหน่งร้านบนแผนที่ แล้วกดนำทางด้วย Google Maps ได้ทันทีจากหน้ารายละเอียดร้าน',
  },
]

export function About() {
  const restaurants = useRestaurantViews()
  const categories = useCategories()
  const menus = restaurants.reduce((total, restaurant) => total + restaurant.menus.length, 0)
  const reviews = restaurants.reduce((total, restaurant) => total + restaurant.reviewCount, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">About</p>
        <h1 className="text-3xl sm:text-4xl">เกี่ยวกับ Suan Dusit Food Guide</h1>
        <p className="mt-4 text-lg text-body">
          โปรเจตคนี้สร้างขึ้นในรายวิชา พลังสวนดุสิต โดยนำเสนอเมนูแนะนำ ของแต่ละร้านรั้วในมหาวิทยาลัยสวนดุสิต
        </p>
      </header>

      <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'ร้านอาหาร', value: restaurants.length },
          { label: 'หมวดหมู่', value: categories.length },
          { label: 'เมนู', value: menus },
          { label: 'รีวิว', value: reviews },
        ].map((stat) => (
          <div key={stat.label} className="rounded-card bg-white p-5 ring-1 ring-line/70">
            <dt className="text-sm text-muted">{stat.label}</dt>
            <dd className="font-display text-3xl text-ink">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-14">
        <h2 className="text-2xl">ใช้งานอย่างไร</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <article key={step.title} className="rounded-card bg-white p-6 ring-1 ring-line/70">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon name={step.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg">
                <span className="text-brand-300">{index + 1}. </span>
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-body">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-card bg-navy-700 p-8 text-white">
        <h2 className="text-2xl text-white">อยากแนะนำร้านใหม่?</h2>
        <p className="mt-3 max-w-2xl text-navy-100">
          ข้อมูลร้านทั้งหมดบนเว็บไซต์นี้ดูแลโดยทีมผู้ดูแลระบบผ่านหน้า Admin
          ถ้าคุณรู้จักร้านอร่อยแถวมหาวิทยาลัยที่ยังไม่มีในนี้
          ส่งชื่อร้าน ที่อยู่ และเมนูเด็ดมาให้ทีมงาน เราจะตรวจสอบและเพิ่มให้
        </p>
        <ul className="mt-6 grid gap-3 text-navy-100/90 sm:grid-cols-2">
          {[
            'ชื่อร้านและที่อยู่ หรือพิกัดบน Google Maps',
            'ประเภทอาหารและช่วงราคาโดยประมาณ',
            'เวลาเปิด-ปิด และวันที่เปิดให้บริการ',
            'รูปหน้าร้านหรือเมนูเด็ด (ถ้ามี)',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-gold-400" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-7">
          <ButtonLink to="/restaurants" variant="gold" iconRight="arrowRight">
            ดูร้านทั้งหมด
          </ButtonLink>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">หมายเหตุ</h2>
        <ul className="mt-4 space-y-3 text-body">
          <li className="flex gap-3">
            <Icon name="info" className="mt-1 h-4 w-4 shrink-0 text-brand-500" />
            เว็บไซต์นี้จัดทำขึ้นเพื่อการศึกษา ไม่ใช่เว็บไซต์ทางการของมหาวิทยาลัยสวนดุสิต
            และไม่มีส่วนเกี่ยวข้องกับการรับรองคุณภาพร้านค้าใด ๆ
          </li>
          <li className="flex gap-3">
            <Icon name="info" className="mt-1 h-4 w-4 shrink-0 text-brand-500" />
            ราคาและเวลาเปิด-ปิดอาจเปลี่ยนแปลงได้ตามร้าน แนะนำให้โทรสอบถามก่อนเดินทาง
          </li>
          <li className="flex gap-3">
            <Icon name="info" className="mt-1 h-4 w-4 shrink-0 text-brand-500" />
            ข้อมูลร้านตัวอย่างที่มาพร้อมระบบเป็นข้อมูลสมมติสำหรับทดสอบ
            ผู้ดูแลระบบสามารถแก้ไขหรือลบได้ทั้งหมด
          </li>
          <li className="flex gap-3">
            <Icon name="info" className="mt-1 h-4 w-4 shrink-0 text-brand-500" />
            จัดทำขึ้้นสำหรับรายวิชา พลังสวนดุสิต
          </li>
        </ul>
      </section>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="font-display text-7xl text-brand-200">404</p>
      <h1 className="mt-4 text-3xl">ไม่พบหน้าที่คุณกำลังมองหา</h1>
      <p className="mt-3 text-body">
        ลิงก์อาจหมดอายุ หรือหน้านี้ถูกย้ายไปแล้ว ลองกลับไปเริ่มที่หน้าแรกดูอีกครั้ง
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/" icon="home">
          กลับหน้าแรก
        </ButtonLink>
        <ButtonLink to="/restaurants" variant="outline" iconRight="arrowRight">
          ดูร้านอาหารทั้งหมด
        </ButtonLink>
      </div>
    </div>
  )
}

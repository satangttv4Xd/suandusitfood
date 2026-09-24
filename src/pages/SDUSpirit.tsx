import { Icon, type IconName } from '../components/Icon'
import { ButtonLink } from '../components/ui'

interface SpiritItem {
  id: string
  number: number
  title: string
  subtitle: string
  icon: IconName
  tone: 'brand' | 'gold' | 'navy' | 'green'
  foodConnection: string
  behaviorConnection: string
}

const SPIRIT_ITEMS: SpiritItem[] = [
  {
    id: 'personality',
    number: 1,
    title: 'บุคลิกภาพดี',
    subtitle: 'Good Personality & Posture',
    icon: 'sparkles',
    tone: 'brand',
    foodConnection:
      'การเลือกรับประทานอาหารที่มีคุณค่า สะอาด ถูกสุขอนามัย ส่งเสริมสุขภาพร่างกาย ผิวพรรณสดใส และสร้างบุคลิกภาพที่ดีจากภายในสู่ภายนอก',
    behaviorConnection:
      'แต่งกายชุดนักศึกษาถูกต้องตามระเบียบ 100% ยืนตัวตรง อกผาย ไหล่ผึ่ง ยิ้มแย้ม มั่นใจ สง่างามทั้งเวลาต่อแถวสั่งอาหารและการยืนถ่ายรูปแนะนำร้านอาหาร',
  },
  {
    id: 'humble',
    number: 2,
    title: 'อ่อนน้อมถ่อมตน',
    subtitle: 'Politeness & Humility',
    icon: 'heart',
    tone: 'gold',
    foodConnection:
      'ให้เกียรติผู้ปรุงอาหารและผู้ให้บริการ มีมารยาทต่อพ่อค้าแม่ค้าและคุณป้าประจำร้านอาหาร',
    behaviorConnection:
      'ใช้คำพูดที่สุภาพ “สวัสดีครับ/ค่ะ ขอบคุณครับ/ค่ะ” เคารพผู้อื่น ไม่ส่งเสียงดังรบกวนในโรงอาหารหรือร้านอาหาร',
  },
  {
    id: 'value',
    number: 3,
    title: 'ดำรงตนอย่างมีคุณค่า',
    subtitle: 'Integrity & Mindful Living',
    icon: 'coin',
    tone: 'green',
    foodConnection:
      'เลือกรับประทานอาหารที่คุ้มค่า สอดคล้องกับงบประมาณนักศึกษา และเห็นคุณค่าของอาหารทุกจาน ไม่สั่งเกินตัว ทานหมดจานไม่เหลือทิ้ง',
    behaviorConnection:
      'บริหารจัดการเวลาและค่าใช้จ่ายอย่างคุ้มค่า ดำเนินชีวิตด้วยความซื่อสัตย์ ไม่แซงคิว และเคารพสิทธิของผู้อื่น',
  },
  {
    id: 'craftsmanship',
    number: 4,
    title: 'ทำงานด้วยความประณีต',
    subtitle: 'Refinement & Craftsmanship',
    icon: 'utensils',
    tone: 'brand',
    foodConnection:
      'สะท้อนความเป็นเลิศและชื่อเสียงด้านอาหารของสวนดุสิต (โรงเรียนการเรือน) ที่มีความพิถีพิถัน ละเอียดประณีตทั้งรสชาติและการจัดจาน',
    behaviorConnection:
      'จัดทำเว็บไซต์คู่มืออาหารด้วยความใส่ใจ คัดเลือกรูปภาพสวยงาม ตรวจสอบความถูกต้องของพิกัดและราคาอย่างละเอียดรอบคอบ',
  },
  {
    id: 'leadership',
    number: 5,
    title: 'เป็นผู้นำ',
    subtitle: 'Proactive Leadership',
    icon: 'star',
    tone: 'gold',
    foodConnection:
      'เป็นผู้นำในการแนะนำร้านอาหารอร่อย มีคุณภาพ ปลอดภัย และราคาเป็นมิตรให้กับเพื่อนนักศึกษาและบุคคลทั่วไป',
    behaviorConnection:
      'ริเริ่มลงมือสร้างสรรค์สิ่งใหม่ กล้าแสดงออกในทางที่ถูกต้อง เป็นแบบอย่างที่ดีในการปฏิบัติตามกฎระเบียบของมหาวิทยาลัย',
  },
  {
    id: 'generosity',
    number: 6,
    title: 'เสียสละเอื้ออาทร',
    subtitle: 'Kindness & Community Sharing',
    icon: 'users',
    tone: 'navy',
    foodConnection:
      'แบ่งปันรีวิวและข้อมูลที่เป็นประโยชน์ สละที่นั่งในโรงอาหารช่วงเวลาเร่งด่วนให้กับผู้ที่มีความจำเป็นมากกว่า',
    behaviorConnection:
      'มีน้ำใจช่วยเหลือผู้อื่น เก็บจานชามและเช็ดโต๊ะให้สะอาดเรียบร้อยหลังรับประทาน เพื่ออำนวยความสะดวกแก่ผู้ใช้บริการคนถัดไป',
  },
  {
    id: 'pride',
    number: 7,
    title: 'รักและศรัทธามหาวิทยาลัย',
    subtitle: 'Pride & Loyalty to SDU',
    icon: 'cap',
    tone: 'brand',
    foodConnection:
      'ภาคภูมิใจในวัฒนธรรมและตำนานอาหารรอบรั้วสวนดุสิต สนับสนุนร้านค้าของมหาวิทยาลัยและร้านค้าในชุมชนโดยรอบ',
    behaviorConnection:
      'ร่วมเผยแพร่สิ่งดีงามของมหาวิทยาลัยสวนดุสิตสู่สังคมภายนอก รักษาเกียรติและชื่อเสียงของสถาบันในทุกการกระทำ',
  },
  {
    id: 'participation',
    number: 8,
    title: 'มีส่วนร่วมในการดำเนินงาน',
    subtitle: 'Active Collaboration',
    icon: 'dashboard',
    tone: 'green',
    foodConnection:
      'เปิดโอกาสให้นักศึกษาทุกคนมีส่วนร่วมแนะนำร้านใหม่ แสดงความคิดเห็น และร่วมเขียนรีวิวเพื่อพัฒนาคู่มืออาหารร่วมกัน',
    behaviorConnection:
      'ทำงานเป็นทีมระหว่างเพื่อนต่างสาขาวิชา รับฟังความคิดเห็นและร่วมมือร่วมใจกันสร้างสรรค์ผลงานเพื่อส่วนรวม',
  },
  {
    id: 'identity',
    number: 9,
    title: 'แสดงความเป็นสวนดุสิต',
    subtitle: 'Embodying Suan Dusit Spirit',
    icon: 'sparkles',
    tone: 'gold',
    foodConnection:
      'สื่อสารเอกลักษณ์อันโดดเด่นของสวนดุสิตผ่านศาสตร์ด้านอาหาร การบริการที่อบอุ่น และความเชี่ยวชาญระดับแนวหน้า',
    behaviorConnection:
      'สวมใส่เครื่องแบบนักศึกษาด้วยความสง่างามและความภาคภูมิใจ ประพฤติตนเป็นสุภาพชนตามอัตลักษณ์บัณฑิตสวนดุสิต',
  },
]

export function SDUSpirit() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* -------------------------------------------------------- Hero */}
      <header className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase ring-1 ring-brand-100">
          <Icon name="cap" className="h-4 w-4" />
          SDU SPIRIT & IDENTITY
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl">
          SDU Spirit กับคู่มืออาหารสวนดุสิต
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-body">
          การนำจิตวิญญาณและอัตลักษณ์อันทรงคุณค่าของมหาวิทยาลัยสวนดุสิต 9 ประการ
          มาเชื่อมโยงกับการพัฒนาเว็บไซต์คู่มืออาหาร มารยาทการรับประทานอาหาร
          และการเสริมสร้างบุคลิกภาพที่ดีของนักศึกษา
        </p>

      </header>

      {/* ------------------------------------------- Posture & Photo Spotlight */}
      <section className="mt-16 overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-line/80">
        <div className="grid items-center lg:grid-cols-[1.1fr_1fr]">
          {/* SDU Spirit Image */}
          <div className="relative overflow-hidden bg-navy-900 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <img
              src="/images/sdu-spirit.png"
              alt="SDU Spirit มหาวิทยาลัยสวนดุสิต ตัวอย่างนักศึกษาแต่งกายถูกระเบียบและบุคลิกภาพดี"
              className="w-full rounded-2xl object-cover shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
            />
          </div>

          {/* Guidelines & Analysis */}
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-lg bg-gold-300/25 px-3 py-1 text-xs font-bold text-gold-800">
              <Icon name="camera" className="h-4 w-4 text-gold-700" />
              การยืนถ่ายรูป & บุคลิกภาพที่ดี
            </div>

            <h2 className="mt-3 text-2xl font-bold sm:text-3xl text-ink">
              ตัวอย่างบุคลิกภาพที่ดีของนักศึกษา
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-body">
              ภาพต้นแบบ SDU Spirit สะท้อนให้เห็นถึงพลังแห่งความมั่นใจ ความสุภาพ
              และการแต่งกายถูกระเบียบของนักศึกษามหาวิทยาลัยสวนดุสิต ซึ่งนำมาเป็นแนวปฏิบัติในโครงการนี้:
            </p>

            <ul className="mt-6 space-y-4 text-sm text-body">
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <div>
                  <strong className="text-ink">ท่ายืนถ่ายรูปที่สง่างามและมั่นใจ:</strong>
                  <p className="mt-0.5 text-muted">
                    ยืนหลังตรง อกผาย ไหล่ผึ่ง ใบหน้ายิ้มแย้มสดใส สายตามุ่งมั่น ท่าทางสุภาพ
                    เช่น ท่ายืนกอดอก ท่ายืนจับเนกไท หรือยืนประสานมือด้านหน้า แสดงถึงวุฒิภาวะและความเป็นมืออาชีพ
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gold-300/25 text-gold-700">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <div>
                  <strong className="text-ink">การแต่งกายชุดนักศึกษาถูกต้อง 100%:</strong>
                  <p className="mt-0.5 text-muted">
                    เสื้อเชิ้ตขาวสะอาดเรียบตึง ติดกระดุมและเข็มตรามหาวิทยาลัยครบถ้วน ผูกเนกไทถูกระเบียบ
                    เข็มขัดตรามหาวิทยาลัย กางเกง/กระโปรงทรงสุภาพ รองเท้าถูกระเบียบ
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <div>
                  <strong className="text-ink">การนำไปใช้ในทีมงาน Suan Dusit Food Guide:</strong>
                  <p className="mt-0.5 text-muted">
                    นำมาใช้เป็นมาตรฐานในการถ่ายภาพสมาชิกผู้จัดทำโครงงาน (หน้าสมาชิกผู้จัดทำ)
                    รวมถึงการแต่งกายเรียบร้อยเวลาลงพื้นที่สำรวจร้านอาหารจริงรอบรั้วมหาวิทยาลัย
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/team" icon="users" size="sm">
                ดูภาพสมาชิกผู้จัดทำ
              </ButtonLink>
              <ButtonLink to="/restaurants" variant="outline" size="sm" iconRight="arrowRight">
                สำรวจร้านอาหาร
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------- SDU Spirit 9 Pillars Grid */}
      <section className="mt-20">
        <div className="text-center">
          <span className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">
            Core Values
          </span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl text-ink">
            SDU Spirit 9 ประการ กับบริบทอาหารและเว็บไซต์
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-body">
            ถอดบทเรียนความเชื่อมโยงระหว่างอัตลักษณ์นักศึกษาสวนดุสิตกับการดำเนินงานเว็บไซต์
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SPIRIT_ITEMS.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-3xl bg-white p-7 shadow-card ring-1 ring-line/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon name={item.icon} className="h-6 w-6" />
                </span>
                <span className="font-display text-2xl font-bold text-muted/60">
                  #{String(item.number).padStart(2, '0')}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-xl font-bold text-ink">{item.title}</h3>
                <p className="text-xs font-medium text-brand-600 tracking-wide uppercase">
                  {item.subtitle}
                </p>
              </div>

              <div className="mt-5 space-y-3.5 flex-1">
                <div className="rounded-2xl bg-cream-deep/50 p-3.5 ring-1 ring-line/60">
                  <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Icon name="utensils" className="h-3.5 w-3.5 text-brand-600" />
                    เชื่อมโยงกับอาหารและโภชนาการ:
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-body">
                    {item.foodConnection}
                  </p>
                </div>

                <div className="rounded-2xl bg-brand-50/40 p-3.5 ring-1 ring-brand-100/60">
                  <p className="text-xs font-bold text-brand-800 flex items-center gap-1.5">
                    <Icon name="sparkles" className="h-3.5 w-3.5 text-brand-600" />
                    การปฏิบัติตนและบุคลิกภาพ:
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-body">
                    {item.behaviorConnection}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------- Student Cafeteria Code */}
      <section className="mt-20 rounded-3xl bg-navy-800 p-8 sm:p-12 text-white shadow-lift">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-300">
            <Icon name="cap" className="h-4 w-4" />
            วัฒนธรรมชาวสวนดุสิต
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">
            กฎ 4 ข้อในการรับประทานอาหารและยืนถ่ายรูปด้วย SDU Spirit
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-navy-100/90">
            แนวปฏิบัติง่าย ๆ ที่นักศึกษาสวนดุสิตสามารถนำไปใช้ในชีวิตประจำวัน
            ทั้งในโรงอาหาร ร้านรอบมหาวิทยาลัย และการร่วมกิจกรรมต่าง ๆ
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: '1. ยืนสง่างาม ถูกระเบียบ',
              desc: 'ยืนตัวตรง อกผาย ไหล่ผึ่ง แต่งเครื่องแบบเรียบร้อย พร้อมรอยยิ้มที่สดใสทั้งเวลาถ่ายรูปและใช้บริการ',
              icon: 'camera',
            },
            {
              title: '2. เข้าคิวอย่างมีวินัย',
              desc: 'ต่อแถวสั่งอาหารอย่างเป็นระเบียบ ไม่แซงคิว เคารพสิทธิของเพื่อนนักศึกษาและอาจารย์',
              icon: 'users',
            },
            {
              title: '3. สุภาพ อ่อนน้อม',
              desc: 'กล่าวคำว่า “ขอบคุณ” ต่อผู้ปรุงอาหารและผู้ให้บริการทุกครั้งด้วยความจริงใจและอ่อนน้อมถ่อมตน',
              icon: 'heart',
            },
            {
              title: '4. รับผิดชอบต่อพื้นที่',
              desc: 'เมื่อรับประทานเสร็จ นำภาชนะไปเก็บยังจุดที่กำหนด เช็ดทำความสะอาดโต๊ะเพื่อผู้ใช้บริการคนถัดไป',
              icon: 'check',
            },
          ].map((rule) => (
            <div
              key={rule.title}
              className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-xs"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-navy-950 font-bold">
                <Icon name={rule.icon as IconName} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-white">{rule.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-navy-100/80">{rule.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-8">
          <p className="text-xs text-navy-100/70">
            โปรเจกต์คู่มือร้านอาหาร Suan Dusit Food Guide — เพื่อการศึกษาในรายวิชา พลังสวนดุสิต
          </p>
          <div className="flex gap-3">
            <ButtonLink to="/restaurants" variant="gold" size="sm" iconRight="arrowRight">
              ค้นหาร้านอาหาร
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}

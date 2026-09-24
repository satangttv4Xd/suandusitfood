import { useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { ButtonLink } from '../components/ui'

interface SpiritItem {
  id: string
  number: number
  title: string
  subtitle: string
  icon: IconName
  tone: 'brand' | 'gold' | 'navy' | 'green'
  imageFeature: string // สิ่งที่ปรากฏในรูปภาพต้นแบบ (ท่ายืน, เสื้อผ้า, การวางมือ, แววตา)
  foodConnection: string // เชื่อมโยงกับอาหาร, โภชนาการ และวัฒนธรรมอาหารสวนดุสิต
  webActionConnection: string // เชื่อมโยงกับเว็บไซต์ Suan Dusit Food Guide, การทำโครงงาน และมารยาทในโรงอาหาร
}

const SPIRIT_ITEMS: SpiritItem[] = [
  {
    id: 'personality',
    number: 1,
    title: 'บุคลิกภาพดี',
    subtitle: 'Good Personality & Posture',
    icon: 'sparkles',
    tone: 'brand',
    imageFeature:
      'ในรูปภาพต้นแบบเห็นนักศึกษายืนตัวตรง อกผาย ไหล่ผึ่ง ไม่ห่อไหล่ จัดระเบียบร่างกายสง่างาม ทรงผมเรียบร้อย เสื้อเชิ้ตขาวสะอาดรีดเรียบตึง ผูกเนกไทตรงกึ่งกลาง ท่ายืนกอดอกและจับเนกไทเปี่ยมด้วยความมั่นใจและน่าเชื่อถือ',
    foodConnection:
      'บุคลิกภาพดีสร้างได้จากภายในสู่ภายนอกด้วยการเลือกรับประทานอาหารที่มีประโยชน์ ครบ 5 หมู่ ถูกสุขอนามัย ลดอาหารหวาน มัน เค็ม ดื่มน้ำสะอาด ช่วยให้ร่างกายสมส่วน ผิวพรรณสดใส และมีพลังในการเรียน',
    webActionConnection:
      'นำท่วงท่าการยืนและบุคลิกภาพจากในรูปมาใช้เป็นมาตรฐานในการถ่ายภาพสมาชิกผู้จัดทำโครงงาน (หน้าทีมงาน) ตลอดจนการยืนต่อคิวสั่งอาหารในโรงอาหารอย่างสง่างาม ไม่ยืนขวางทางเดิน และรักษาความเรียบร้อย',
  },
  {
    id: 'humble',
    number: 2,
    title: 'อ่อนน้อมถ่อมตน',
    subtitle: 'Politeness & Humility',
    icon: 'heart',
    tone: 'gold',
    imageFeature:
      'ในรูปภาพสะท้อนผ่านสีหน้า รอยยิ้มที่อบอุ่นและเป็นมิตร แววตาสุภาพนุ่มนวล ท่าทางการวางมือและแขนไม่ก้าวร้าว ไม่ยกตนข่มท่าน สื่อถึงความเป็นสุภาพชนที่มีสัมมาคารวะ เข้าถึงง่ายและน่าเข้าใกล้',
    foodConnection:
      'การตระหนักรู้และให้เกียรติผู้ปรุงอาหาร รับรู้ถึงความเหน็ดเหนื่อยของพ่อครัวแม่ครัว ไม่เลือกกินหรือดูถูกอาหาร เปิดใจเรียนรู้วัฒนธรรมอาหารที่หลากหลายด้วยความเคารพในวัตถุดิบและภูมิปัญญาท้องถิ่น',
    webActionConnection:
      'การมีสัมมาคารวะต่อพ่อค้าแม่ค้าและคุณป้าประจำร้านอาหาร พูดจาไพเราะ “สวัสดีครับ/ค่ะ ขออนุญาตครับ/ค่ะ ขอบคุณครับ/ค่ะ” เสมอ รวมถึงการเขียนรีวิวแนะนำร้านอาหารบนเว็บด้วยเจตนาสร้างสรรค์ ติเพื่อก่อ และให้กำลังใจร้านค้า',
  },
  {
    id: 'value',
    number: 3,
    title: 'ดำรงตนอย่างมีคุณค่า',
    subtitle: 'Integrity & Mindful Living',
    icon: 'coin',
    tone: 'green',
    imageFeature:
      'ในรูปภาพสะท้อนผ่านแววตาที่มีจุดมุ่งหมาย ความภาคภูมิใจในตนเอง และความพร้อมในการพัฒนาตน ยืนหยัดอย่างสง่างามด้วยเกียรติและศักดิ์ศรีของนักศึกษามหาวิทยาลัยสวนดุสิตที่เป็นตัวแทนคนรุ่นใหม่ที่มีคุณภาพ',
    foodConnection:
      'การเห็นคุณค่าของอาหารทุกจานตามแนวคิด Zero Food Waste ไม่สั่งอาหารเกินตัว ตักหรือสั่งแต่พอดี รับประทานอาหารจนหมดจานไม่เหลือทิ้ง และเลือกรับประทานอาหารที่คุ้มค่าต่อสุขภาพและงบประมาณ',
    webActionConnection:
      'เว็บไซต์พัฒนาระบบคัดกรองร้านอาหารราคาประหยัด เพื่อช่วยนักศึกษาบริหารจัดการค่าครองชีพอย่างมีคุณค่าและคุ้มค่า พร้อมรณรงค์การเข้าคิวซื้ออาหารอย่างซื่อสัตย์ ไม่แซงคิว และเคารพสิทธิของเพื่อนนักศึกษาทุกคน',
  },
  {
    id: 'craftsmanship',
    number: 4,
    title: 'ทำงานด้วยความประณีต',
    subtitle: 'Refinement & Craftsmanship',
    icon: 'utensils',
    tone: 'brand',
    imageFeature:
      'ในรูปภาพแสดงถึงความประณีตละเอียดลออตั้งแต่หัวจรดเท้า เสื้อเชิ้ตไม่มีรอยยับ การผูกเงื่อนเนกไทได้รูปสมดุลสมบูรณ์แบบ เข็มกลัดและหัวเข็มขัดตราสัญลักษณ์มหาวิทยาลัยติดตรงแนวอย่างประณีต ไร้ที่ติ',
    foodConnection:
      'สะท้อนดีเอ็นเอของ “โรงเรียนการเรือน สวนดุสิต” ซึ่งขึ้นชื่อเรื่องความประณีต ศิลปะการปรุงอาหารและการจัดแต่งจาน การชั่งตวงวัดวัตถุดิบอย่างพิถีพิถัน และความสะอาดในทุกขั้นตอนการประกอบอาหาร',
    webActionConnection:
      'ทีมงานจัดทำเว็บไซต์คู่มืออาหารด้วยความประณีต ใส่ใจทุกรายละเอียด คัดเลือกรูปภาพความละเอียดสูง ตรวจสอบพิกัด GPS เบอร์โทรศัพท์ และราคาอาหารให้ถูกต้องแม่นยำ พร้อมการออกแบบ UI ที่เป็นระเบียบสวยงาม',
  },
  {
    id: 'leadership',
    number: 5,
    title: 'เป็นผู้นำ',
    subtitle: 'Proactive Leadership',
    icon: 'star',
    tone: 'gold',
    imageFeature:
      'ในรูปภาพสะท้อนผ่านท่ายืนที่องอาจ สง่าผ่าเผย สายตามองตรงไปข้างหน้าอย่างเด็ดเดี่ยว มั่นใจ การยืนกอดอกในมุมเฉียงแสดงถึงพลังแห่งการเป็นผู้นำที่มีวิสัยทัศน์ พร้อมก้าวไปข้างหน้าและนำพาความเปลี่ยนแปลงที่ดี',
    foodConnection:
      'การเป็นผู้นำในการรณรงค์สุขอนามัยอาหาร (Food Safety & Hygiene) ในกลุ่มเพื่อน ชักชวนกันเลือกบริโภคอาหารที่สะอาด ปลอดภัย ไร้สารปนเปื้อน และเป็นแบบอย่างในการดูแลสุขภาพผ่านโภชนาการที่ดี',
    webActionConnection:
      'การริเริ่มสร้างสรรค์เว็บไซต์ Suan Dusit Food Guide เพื่อเป็นผู้นำด้านสารสนเทศร้านอาหารแก่นักศึกษาใหม่และบุคลากร ตลอดจนเป็นผู้นำในการรณรงค์กฎระเบียบโรงอาหาร เช่น การแยกเศษอาหารและการเก็บจานชาม',
  },
  {
    id: 'generosity',
    number: 6,
    title: 'เสียสละเอื้ออาทร',
    subtitle: 'Kindness & Community Sharing',
    icon: 'users',
    tone: 'navy',
    imageFeature:
      'ในรูปภาพแสดงถึงการยืนเคียงข้างกันของตัวแทนนักศึกษาชายและหญิงด้วยความสมานฉันท์ สีหน้าเปี่ยมด้วยไมตรีจิต อบอุ่น และแววตาที่พร้อมจะยื่นมือช่วยเหลือเกื้อกูลผู้อื่น สื่อถึงจิตวิญญาณแห่งการให้และความสามัคคี',
    foodConnection:
      'การแบ่งปันความสุขผ่านมื้ออาหาร มีน้ำใจแบ่งปันอาหารหรือของว่างให้เพื่อนร่วมชั้น การสละที่นั่งในโรงอาหารช่วงเวลาเร่งด่วน (11.30 - 13.00 น.) ให้แก่ผู้ที่มีความจำเป็น เช่น ผู้ป่วย ผู้สูงวัย หรือเพื่อนที่ถือถาดอาหารหนัก',
    webActionConnection:
      'สมาชิกผู้จัดทำเสียสละเวลาว่างส่วนตัวลงพื้นที่สำรวจร้านอาหารจริงรอบมหาวิทยาลัยเพื่อนำข้อมูลมารวบรวมและแบ่งปันแก่ทุกคนฟรี และเมื่อรับประทานอาหารเสร็จ ยินดีเสียสละเวลาเก็บภาชนะและเช็ดโต๊ะเพื่อคนถัดไป',
  },
  {
    id: 'pride',
    number: 7,
    title: 'รักและศรัทธามหาวิทยาลัย',
    subtitle: 'Pride & Loyalty to SDU',
    icon: 'cap',
    tone: 'brand',
    imageFeature:
      'ในรูปภาพทุกคนสวมใส่เครื่องแบบนักศึกษาพร้อมประดับตรามหาวิทยาลัยสวนดุสิตอย่างภาคภูมิใจ ทั้งเข็มตรามหาวิทยาลัยที่หน้าอกเสื้อ เนกไทลายตราสถาบัน และหัวเข็มขัดโลหะเงางาม แสดงถึงความจงรักภักดีและความรักในสถาบัน',
    foodConnection:
      'ภาคภูมิใจในตำนานอาหารและเบเกอรี่ของสวนดุสิตที่เป็นที่ยอมรับระดับประเทศ เช่น ท็อฟฟี่เค้กโฮมเบเกอรี่ ขนมไทยชาววัง และอาหารปรุงสุกสะอาดจากครัวสวนดุสิต โดยร่วมอุดหนุนและบอกต่อของอร่อยของสถาบัน',
    webActionConnection:
      'การออกแบบเว็บไซต์โดยใช้โทนสีประจำมหาวิทยาลัย (สีฟ้าคราม-ทอง-แดงเลือดนก) พร้อมบรรจุประวัติความเป็นมาและร้านอาหารอันเป็นเอกลักษณ์ของมหาวิทยาลัยสวนดุสิตเพื่อร่วมเชิดชูชื่อเสียงของสถาบันสู่สายตาประชาชน',
  },
  {
    id: 'participation',
    number: 8,
    title: 'มีส่วนร่วมในการดำเนินงาน',
    subtitle: 'Active Collaboration & Teamwork',
    icon: 'dashboard',
    tone: 'green',
    imageFeature:
      'ในรูปภาพคือภาพหมู่ของตัวแทนนักศึกษาที่มาร่วมแรงร่วมใจกันถ่ายภาพประชาสัมพันธ์ เป็นตัวอย่างที่เป็นรูปธรรมของการมีส่วนร่วมในกิจกรรมส่วนรวมของมหาวิทยาลัยด้วยความพร้อมเพรียงและเต็มใจ',
    foodConnection:
      'การมีส่วนร่วมดูแลสิ่งแวดล้อมและบรรยากาศในโรงอาหาร ทุกคนร่วมมือกันรักษาความสะอาด ทิ้งขยะลงถังให้ถูกต้อง และช่วยกันสอดส่องดูแลความสะอาดของจุดบริการน้ำดื่มและโต๊ะอาหาร',
    webActionConnection:
      'การทำงานร่วมกันเป็นทีมของนักศึกษาต่างสาขาวิชาในการเก็บข้อมูล ถ่ายภาพอาหาร ทดสอบระบบ และบนเว็บไซต์ยังเปิดโอกาสให้นักศึกษาทุกคนมีส่วนร่วมในการส่งข้อมูลร้านค้าใหม่และเขียนรีวิวแบ่งปันประสบการณ์',
  },
  {
    id: 'identity',
    number: 9,
    title: 'แสดงความเป็นสวนดุสิต',
    subtitle: 'Embodying Suan Dusit Identity',
    icon: 'sparkles',
    tone: 'gold',
    imageFeature:
      'ภาพรวมทั้งหมดของนักศึกษาในรูปภาพคือบทสรุปของ “อัตลักษณ์ชาวสวนดุสิต” อย่างแท้จริง มีบุคลิกภาพสง่างาม กิริยาสุภาพ มารยาทเรียบร้อย อ่อนหวานแต่เข้มแข็ง โดดเด่นเป็นที่ประจักษ์ในทุกมุมมอง',
    foodConnection:
      'สะท้อนเอกลักษณ์ความเชี่ยวชาญด้านอาหารและการบริการอันดับหนึ่งของสวนดุสิต ความสะอาด สุขอนามัย รสชาติอาหารไทยแท้ การจัดสำรับที่ประณีต และการให้บริการที่เปี่ยมด้วยไมตรีจิตและรอยยิ้มแบบชาววัง',
    webActionConnection:
      'เว็บไซต์ Suan Dusit Food Guide ทำหน้าที่เป็นสื่อกลางถ่ายทอด “ความเป็นสวนดุสิต” สู่โลกดิจิทัล ผ่านการผสมผสานศาสตร์แห่งอาหาร วัฒนธรรมชาวสวนดุสิต และเทคโนโลยีสมัยใหม่เข้าด้วยกันอย่างลงตัว',
  },
]

export function SDUSpirit() {
  const [filterTone, setFilterTone] = useState<string>('all')

  const filteredItems =
    filterTone === 'all'
      ? SPIRIT_ITEMS
      : SPIRIT_ITEMS.filter((item) => item.tone === filterTone)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* -------------------------------------------------------- Hero Header */}
      <header className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase ring-1 ring-brand-100">
          <Icon name="cap" className="h-4 w-4" />
          SDU SPIRIT & IDENTITY FRAMEWORK
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-ink">
          เชื่อมโยง SDU Spirit 9 ประการในรูปภาพ
          <span className="block mt-1 bg-gradient-to-r from-brand-600 via-gold-600 to-navy-700 bg-clip-text text-transparent">
            สู่คู่มืออาหารและบุคลิกภาพนักศึกษา
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-body max-w-3xl mx-auto">
          การวิเคราะห์เจาะลึก <strong>ทุกข้อที่ปรากฏในรูปภาพโปสเตอร์ SDU Spirit ทั้ง 9 ประการ</strong>{' '}
          เชื่อมโยงกับท่วงท่าการยืนถ่ายรูป เครื่องแบบนักศึกษา พฤติกรรมการรับประทานอาหาร
          และการพัฒนาเว็บไซต์ <strong>Suan Dusit Food Guide</strong> เพื่อการศึกษาในรายวิชา พลังสวนดุสิต
        </p>

        {/* 9 Pills Badges Preview */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {SPIRIT_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#spirit-${item.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs ring-1 ring-slate-200 transition-all hover:bg-brand-50 hover:text-brand-700 hover:ring-brand-200"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {item.number}
              </span>
              <span>{item.title}</span>
            </a>
          ))}
        </div>
      </header>

      {/* ------------------------------------------- Spotlight: Photo & 9 Bullets Analysis */}
      <section className="mt-14 overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-line/80">
        <div className="grid items-stretch lg:grid-cols-[1.1fr_1.1fr]">
          {/* SDU Spirit Image Container */}
          <div className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
            <div className="w-full relative group">
              <img
                src="/images/sdu-spirit.png"
                alt="SDU Spirit มหาวิทยาลัยสวนดุสิต ตัวอย่างนักศึกษาแต่งกายถูกระเบียบและบุคลิกภาพดี 9 ประการ"
                className="w-full rounded-2xl object-cover shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-navy-950/85 px-3.5 py-2 text-xs text-white/90 backdrop-blur-md ring-1 ring-white/10 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Icon name="camera" className="h-4 w-4 text-gold-400" />
                  ภาพต้นแบบ SDU Spirit & Identity
                </span>
                <span className="text-[11px] text-gold-300 font-semibold">9 คุณลักษณะสมบูรณ์</span>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-slate-300 leading-relaxed max-w-md">
              ภาพต้นแบบสะท้อนท่าทางการยืนถ่ายรูปที่สง่างาม การจัดระเบียบร่างกาย และการแต่งกายชุดนักศึกษาถูกต้อง 100%
              ตามระเบียบมหาวิทยาลัยสวนดุสิต
            </p>
          </div>

          {/* Analysis & 9 Bullets Direct Connection */}
          <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-slate-50/40">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-gold-300/25 px-3 py-1 text-xs font-bold text-gold-800">
                <Icon name="sparkles" className="h-4 w-4 text-gold-700" />
                ถอดรหัสข้อมูลในรูปภาพโปสเตอร์
              </div>

              <h2 className="mt-3 text-2xl font-bold sm:text-3xl text-ink">
                9 หัวข้อตามรูปภาพโปสเตอร์ SDU Spirit
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-body">
                ทุกหัวข้อในรูปภาพถูกนำมาวิเคราะห์และเชื่อมโยงเข้ากับพฤติกรรมจริงทั้ง 3 มิติ
                (ท่าทางในรูป + โภชนาการ + การทำเว็บไซต์แนะนำอาหาร):
              </p>

              {/* 9 Bullets List directly matching the cropped photo */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SPIRIT_ITEMS.map((item) => (
                  <a
                    key={item.id}
                    href={`#spirit-${item.id}`}
                    className="group flex items-center gap-2.5 rounded-xl bg-white p-2.5 ring-1 ring-slate-200/80 shadow-2xs transition-all hover:bg-brand-50/50 hover:ring-brand-300"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white group-hover:scale-105 transition-transform">
                      {item.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink truncate group-hover:text-brand-700">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted truncate">{item.subtitle}</p>
                    </div>
                    <Icon
                      name="chevronRight"
                      className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-600 transition-colors"
                    />
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-wrap gap-3">
              <ButtonLink to="/team" icon="users" size="sm">
                ดูภาพสมาชิกผู้จัดทำ (ตามต้นแบบ)
              </ButtonLink>
              <ButtonLink to="/restaurants" variant="outline" size="sm" iconRight="arrowRight">
                สำรวจร้านอาหารในระบบ
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------- SDU Spirit 9 Pillars Detailed Breakdown */}
      <section className="mt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">
              Comprehensive Analysis (ครบทั้ง 9 หัวข้อในรูป)
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-ink">
              การเชื่อมโยงข้อมูลในรูปกับเว็บไซต์และอาหาร
            </h2>
            <p className="mt-2 text-sm sm:text-base text-body max-w-2xl">
              แจกแจงรายละเอียดแบบ 3 มิติ: สิ่งที่เห็นในรูปภาพต้นแบบ, การเลือกรับประทานอาหาร, และการนำไปใช้บนเว็บไซต์ Suan Dusit Food Guide
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-white p-1.5 shadow-2xs ring-1 ring-slate-200 self-start md:self-auto">
            {[
              { label: 'ทั้งหมด (9 ข้อ)', value: 'all' },
              { label: 'อัตลักษณ์ & บุคลิก', value: 'brand' },
              { label: 'คุณธรรม & สังคม', value: 'gold' },
              { label: 'การดำเนินงาน', value: 'green' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterTone(f.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterTone === f.value
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 9 Detailed Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <article
              id={`spirit-${item.id}`}
              key={item.id}
              className="flex flex-col rounded-3xl bg-white p-6 sm:p-7 shadow-card ring-1 ring-line/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift scroll-mt-24"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-ink leading-snug">
                      {item.number}. {item.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-brand-700 tracking-wide uppercase">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <span className="font-display text-2xl font-black text-slate-300">
                  #{String(item.number).padStart(2, '0')}
                </span>
              </div>

              {/* 3 Structured Dimensions */}
              <div className="mt-6 space-y-3.5 flex-1 text-xs">
                {/* 1. In the Image */}
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Icon name="camera" className="h-4 w-4 text-navy-700" />
                    <span>สิ่งที่ปรากฏในรูปภาพต้นแบบ:</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-slate-700">
                    {item.imageFeature}
                  </p>
                </div>

                {/* 2. Food & Nutrition */}
                <div className="rounded-2xl bg-amber-50/60 p-4 ring-1 ring-amber-200/70">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Icon name="utensils" className="h-4 w-4 text-amber-700" />
                    <span>เชื่อมโยงกับอาหาร & โภชนาการ:</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-amber-900/90">
                    {item.foodConnection}
                  </p>
                </div>

                {/* 3. Web & Cafeteria Etiquette */}
                <div className="rounded-2xl bg-brand-50/50 p-4 ring-1 ring-brand-100">
                  <div className="flex items-center gap-1.5 font-bold text-brand-950">
                    <Icon name="sparkles" className="h-4 w-4 text-brand-700" />
                    <span>เชื่อมโยงกับเว็บแนะนำอาหาร & ชีวิตจริง:</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-brand-900/90">
                    {item.webActionConnection}
                  </p>
                </div>
              </div>

              {/* Bottom tag indicator */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-muted">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <Icon name="check" className="h-3 w-3" />
                  สอดคล้องกับโปสเตอร์ SDU Spirit
                </span>
                <a
                  href="#spirit-summary-table"
                  className="hover:text-brand-600 font-medium transition-colors"
                >
                  ดูในตารางสรุป ↑
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------- SDU Spirit 9 Pillars Summary Matrix Table */}
      <section id="spirit-summary-table" className="mt-20 scroll-mt-24">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-card ring-1 ring-line/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider">
                <Icon name="list" className="h-4 w-4" />
                ตารางสรุปการวิเคราะห์เชิงเปรียบเทียบ
              </span>
              <h2 className="mt-1 text-2xl font-bold text-ink">
                สรุปความเชื่อมโยง SDU Spirit 9 ประการในรูปภาพ
              </h2>
            </div>
            <span className="text-xs text-muted">
              ถอดบทเรียนจากภาพต้นแบบสู่การใช้งานจริง
            </span>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold">
                  <th className="py-3 px-3 w-16 text-center">ข้อ</th>
                  <th className="py-3 px-4 w-44">หัวข้อตามรูปภาพ</th>
                  <th className="py-3 px-4">สิ่งที่เห็นในรูปภาพ (Visual)</th>
                  <th className="py-3 px-4">มิติอาหาร & โภชนาการ (Food)</th>
                  <th className="py-3 px-4">มิติเว็บไซต์ & ชีวิตจริง (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-body">
                {SPIRIT_ITEMS.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 text-center font-bold text-brand-600">
                      #{item.number}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-ink">
                      <div>{item.title}</div>
                      <div className="text-[11px] font-normal text-muted">{item.subtitle}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs leading-relaxed text-slate-700">
                      {item.imageFeature}
                    </td>
                    <td className="py-3.5 px-4 text-xs leading-relaxed text-amber-950">
                      {item.foodConnection}
                    </td>
                    <td className="py-3.5 px-4 text-xs leading-relaxed text-brand-950">
                      {item.webActionConnection}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}


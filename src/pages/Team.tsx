import { Icon } from '../components/Icon'
import { SmartImage } from '../components/SmartImage'
import { Badge, ButtonLink, EmptyState } from '../components/ui'
import { useTeamMembers } from '../lib/hooks'

export function Team() {
  const members = useTeamMembers()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* -------------------------------------------------------- Header */}
      <header className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 text-xs font-bold tracking-[0.14em] text-brand-700 uppercase ring-1 ring-brand-100">
          <Icon name="users" className="h-4 w-4" />
          ผู้จัดทำโครงงาน
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl">สมาชิกผู้จัดทำ</h1>
        <p className="mt-4 text-lg text-body">
          คณะผู้จัดทำเว็บไซต์ Suan Dusit Food Guide (คู่มือร้านอาหารรอบมหาวิทยาลัยสวนดุสิต)
          <br className="hidden sm:inline" />
          รายวิชา พลังสวนดุสิต มหาวิทยาลัยสวนดุสิต
        </p>
      </header>

      {/* ------------------------------------------------------- Members */}
      {members.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon="users"
            title="ยังไม่มีข้อมูลสมาชิกผู้จัดทำ"
            description="ผู้ดูแลระบบสามารถเพิ่มรายชื่อและข้อมูลสมาชิกผู้จัดทำได้ที่ระบบหลังบ้าน (Admin Panel)"
            action={
              <ButtonLink to="/admin/team" icon="pencil">
                ไปที่หน้าจัดการสมาชิก
              </ButtonLink>
            }
          />
        </div>
      ) : (
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <article
              key={member.id}
              className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              {/* Photo / Avatar */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50/50">
                {member.image ? (
                  <SmartImage
                    src={member.image}
                    alt={member.name}
                    fallbackLabel={member.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-gold-300/30 text-brand-700">
                    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/90 shadow-sm ring-1 ring-brand-200">
                      <Icon name="user" className="h-10 w-10 text-brand-600" />
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge tone="brand" className="font-mono text-xs">
                    {member.studentId ? `รหัส ${member.studentId}` : 'สมาชิก'}
                  </Badge>
                </div>
              </div>

              {/* Info Body */}
              <div className="flex flex-1 flex-col p-6">
                <div>
                  <h2 className="text-xl text-ink group-hover:text-brand-700 transition-colors">
                    {member.name}
                  </h2>
                  {member.role && (
                    <p className="mt-1 text-sm font-semibold text-brand-600">
                      {member.role}
                    </p>
                  )}
                  {member.faculty && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                      <Icon name="cap" className="h-3.5 w-3.5 shrink-0 text-brand-400" />
                      <span>{member.faculty}</span>
                    </p>
                  )}
                </div>

                {member.bio && (
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-body border-t border-line/60 pt-3">
                    {member.bio}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ----------------------------------------------------- Course Note */}
      <section className="mt-16 rounded-3xl bg-gradient-to-br from-navy-800 to-navy-900 p-8 text-white sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-300">
              <Icon name="cap" className="h-3.5 w-3.5" />
              รายวิชา พลังสวนดุสิต
            </span>
            <h2 className="mt-3 text-2xl text-white sm:text-3xl">มหาวิทยาลัยสวนดุสิต</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-100/90 sm:text-base">
              โครงงานจัดทำขึ้นเพื่อรวบรวมร้านอาหาร แนะนำเมนูอร่อย และเป็นประโยชน์แก่นักศึกษา บุคลากร
              และบุคคลทั่วไปรอบมหาวิทยาลัยสวนดุสิต
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap gap-3">
            <ButtonLink to="/restaurants" variant="gold" iconRight="arrowRight">
              สำรวจร้านอาหาร
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}

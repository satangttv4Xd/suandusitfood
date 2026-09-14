import type { Database } from './types'

/**
 * Demo content shipped with a fresh install.
 *
 * Everything here is written through the same store the admin screens use,
 * so every seeded restaurant, menu, image and category can be edited or
 * deleted from /admin like any other record — nothing is special-cased.
 *
 * Reset to this state any time from Admin → ตั้งค่าข้อมูล.
 */

const now = '2026-09-01T09:00:00.000Z'

const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`

export const seedCategories: Database['categories'] = [
  {
    id: 'cat-tamsang',
    name: 'อาหารตามสั่ง',
    slug: 'tam-sang',
    description: 'ผัดกะเพรา ข้าวผัด ราดหน้า สั่งได้ทุกอย่างจานร้อน ๆ',
    icon: 'wok',
    image: '',
    sortOrder: 1,
    createdAt: now,
  },
  {
    id: 'cat-noodle',
    name: 'ก๋วยเตี๋ยว',
    slug: 'noodle',
    description: 'ก๋วยเตี๋ยวเรือ เย็นตาโฟ บะหมี่ ต้มยำ น้ำใส',
    icon: 'noodle',
    image: '',
    sortOrder: 2,
    createdAt: now,
  },
  {
    id: 'cat-cafe',
    name: 'คาเฟ่',
    slug: 'cafe',
    description: 'กาแฟ ชา ที่นั่งอ่านหนังสือ Wi-Fi แรง ปลั๊กครบ',
    icon: 'coffee',
    image: '',
    sortOrder: 3,
    createdAt: now,
  },
  {
    id: 'cat-dessert',
    name: 'ของหวาน',
    slug: 'dessert',
    description: 'ขนมไทย บิงซู ไอศกรีม เบเกอรี่',
    icon: 'dessert',
    image: '',
    sortOrder: 4,
    createdAt: now,
  },
  {
    id: 'cat-budget',
    name: 'ร้านอาหารราคาประหยัด',
    slug: 'budget',
    description: 'จานละไม่เกิน 50 บาท อิ่มครบทุกวัน',
    icon: 'coin',
    image: '',
    sortOrder: 5,
    createdAt: now,
  },
  {
    id: 'cat-near',
    name: 'ร้านอาหารใกล้มหาวิทยาลัย',
    slug: 'near-campus',
    description: 'เดินถึงจากประตูมหาวิทยาลัยภายใน 5 นาที',
    icon: 'pin',
    image: '',
    sortOrder: 6,
    createdAt: now,
  },
]

const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'] as const

export const seedRestaurants: Database['restaurants'] = [
  {
    id: 'res-khrua-yai',
    name: 'ครัวคุณยาย ซอยระนอง',
    slug: 'khrua-khun-yai',
    coverImage: photo('photo-1559314809-0d155014e29e'),
    description:
      'ร้านอาหารตามสั่งเจ้าเก่าในซอยระนอง เปิดมากว่า 20 ปี จุดเด่นคือกะเพราหมูสับไฟแรงกลิ่นหอมกระทะ และไข่ดาวกรอบ ๆ ที่ทอดสดทุกจาน ราคานักศึกษาจับต้องได้ นั่งได้ทั้งในร้านและโต๊ะหน้าร้าน ช่วงพักเที่ยงคนเยอะ แนะนำให้สั่งกลับหรือมาก่อน 11.30 น.',
    categoryId: 'cat-tamsang',
    priceMin: 45,
    priceAvg: 60,
    rating: 4.6,
    openTime: '07:00',
    closeTime: '19:00',
    openDays: [...weekdays, 'sat'],
    phone: '02-241-0111',
    facebook: 'https://www.facebook.com/',
    instagram: '',
    website: '',
    address: 'ซอยระนอง 2 แขวงถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300',
    lat: 13.7768,
    lng: 100.5203,
    mapUrl: '',
    status: 'open',
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'res-ruea-nung',
    name: 'ก๋วยเตี๋ยวเรือ พี่หนุ่ม ท่าน้ำดุสิต',
    slug: 'kuaytiao-ruea-pi-num',
    coverImage: photo('photo-1569718212165-3a8278d5f624'),
    description:
      'ก๋วยเตี๋ยวเรือน้ำตกสูตรอยุธยา น้ำซุปเข้มข้นเคี่ยวเองทุกเช้า เลือกเส้นได้ครบทั้งเส้นเล็ก เส้นใหญ่ บะหมี่ และวุ้นเส้น ชามเล็กราคาเบา ๆ สั่งได้หลายชามไม่เปลืองกระเป๋า มีหมูตุ๋นและเนื้อตุ๋นให้เลือก ผักและของทอดเติมได้ไม่อั้น',
    categoryId: 'cat-noodle',
    priceMin: 20,
    priceAvg: 45,
    rating: 4.8,
    openTime: '08:00',
    closeTime: '16:00',
    openDays: [...allDays],
    phone: '089-222-3344',
    facebook: '',
    instagram: 'https://www.instagram.com/',
    website: '',
    address: 'ถนนสามเสน ใกล้ท่าน้ำเทเวศร์ เขตดุสิต กรุงเทพมหานคร 10300',
    lat: 13.7739,
    lng: 100.5058,
    mapUrl: '',
    status: 'open',
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'res-dusit-brew',
    name: 'Dusit Brew Café',
    slug: 'dusit-brew-cafe',
    coverImage: photo('photo-1501339847302-ac426a4a7cbb'),
    description:
      'คาเฟ่เล็ก ๆ บรรยากาศสงบ เหมาะกับการนั่งทำงานและติวหนังสือ มีปลั๊กไฟทุกโต๊ะ Wi-Fi เร็ว และโซนเงียบชั้นบน เมล็ดกาแฟคั่วเองจากเชียงราย เอสเปรสโซรสนุ่มไม่เปรี้ยวจัด มีเมนูนมและชาไทยสำหรับคนไม่ดื่มกาแฟ นั่งได้นานไม่จำกัดเวลา',
    categoryId: 'cat-cafe',
    priceMin: 55,
    priceAvg: 95,
    rating: 4.5,
    openTime: '08:30',
    closeTime: '20:00',
    openDays: [...allDays],
    phone: '02-668-7788',
    facebook: 'https://www.facebook.com/',
    instagram: 'https://www.instagram.com/',
    website: 'https://example.com',
    address: '128 ถนนนครราชสีมา แขวงดุสิต เขตดุสิต กรุงเทพมหานคร 10300',
    lat: 13.7781,
    lng: 100.5171,
    mapUrl: '',
    status: 'open',
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'res-bualoy-pa-noi',
    name: 'บัวลอยป้าน้อย',
    slug: 'bualoy-pa-noi',
    coverImage: photo('photo-1563729784474-d77dbb933a9e'),
    description:
      'ขนมไทยหน้าตลาด ขายบัวลอยไข่หวาน กล้วยบวชชี และรวมมิตรน้ำกะทิสด ทำใหม่ทุกวันไม่ใส่สารกันบูด กะทิหอมมันไม่หวานแหลม ซื้อกลับใส่ถุงร้อนได้ ช่วงเย็นหลังเลิกเรียนมักหมดเร็ว แนะนำให้มาก่อน 17.00 น.',
    categoryId: 'cat-dessert',
    priceMin: 25,
    priceAvg: 40,
    rating: 4.7,
    openTime: '10:00',
    closeTime: '18:00',
    openDays: ['tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    phone: '081-555-6677',
    facebook: '',
    instagram: '',
    website: '',
    address: 'ตลาดศรีย่าน ถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300',
    lat: 13.7795,
    lng: 100.5138,
    mapUrl: '',
    status: 'open',
    featured: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'res-sdu-canteen',
    name: 'โรงอาหารกลาง สวนดุสิต',
    slug: 'sdu-central-canteen',
    coverImage: photo('photo-1517248135467-4c7edcad34c4'),
    description:
      'โรงอาหารในมหาวิทยาลัย รวมร้านค้ากว่า 15 ร้านไว้ในที่เดียว ทั้งข้าวราดแกง ก๋วยเตี๋ยว ส้มตำ ข้าวมันไก่ และเครื่องดื่ม ราคาเริ่มต้น 30 บาท ชำระด้วยเงินสดและสแกนจ่ายได้ มีที่นั่งกว้าง แอร์เย็น เหมาะกับมื้อเที่ยงระหว่างคาบเรียน',
    categoryId: 'cat-budget',
    priceMin: 30,
    priceAvg: 45,
    rating: 4.2,
    openTime: '07:00',
    closeTime: '17:00',
    openDays: [...weekdays],
    phone: '02-244-5555',
    facebook: '',
    instagram: '',
    website: 'https://www.dusit.ac.th',
    address: 'มหาวิทยาลัยสวนดุสิต 295 ถนนนครราชสีมา เขตดุสิต กรุงเทพมหานคร 10300',
    lat: 13.7772,
    lng: 100.5186,
    mapUrl: '',
    status: 'open',
    featured: true,
    createdAt: now,
    updatedAt: now,
  },
]

const imageRows: [string, string, string][] = [
  ['res-khrua-yai', 'photo-1552611052-33e04de081de', 'กะเพราหมูสับไข่ดาว'],
  ['res-khrua-yai', 'photo-1585032226651-759b368d7246', 'บรรยากาศหน้าร้าน'],
  ['res-ruea-nung', 'photo-1555126634-323283e090fa', 'ก๋วยเตี๋ยวเรือน้ำตก'],
  ['res-ruea-nung', 'photo-1548943487-a2e4e43b4853', 'เครื่องเคียงและของทอด'],
  ['res-dusit-brew', 'photo-1453614512568-c4024d13c247', 'โซนนั่งทำงานชั้นบน'],
  ['res-dusit-brew', 'photo-1495474472287-4d71bcdd2085', 'ลาเต้ร้อน'],
  ['res-bualoy-pa-noi', 'photo-1488477181946-6428a0291777', 'บัวลอยไข่หวาน'],
  ['res-sdu-canteen', 'photo-1466978913421-dad2ebd01d17', 'โซนเครื่องดื่ม'],
  ['res-sdu-canteen', 'photo-1414235077428-338989a2e8c0', 'ที่นั่งในโรงอาหาร'],
]

export const seedImages: Database['restaurantImages'] = imageRows.map(
  ([restaurantId, id, caption], i) => ({
    id: `img-${i + 1}`,
    restaurantId,
    url: photo(id, 900),
    caption,
    sortOrder: i,
    createdAt: now,
  }),
)

const menuRows: [string, string, number, string, string, boolean][] = [
  ['res-khrua-yai', 'กะเพราหมูสับไข่ดาว', 55, 'ไฟแรงกลิ่นหอมกระทะ เผ็ดได้ตามสั่ง', 'photo-1552611052-33e04de081de', true],
  ['res-khrua-yai', 'ข้าวผัดกุ้ง', 65, 'กุ้งสด 5 ตัว เสิร์ฟพร้อมมะนาวและแตงกวา', 'photo-1603133872878-684f208fb84b', true],
  ['res-khrua-yai', 'ผัดซีอิ๊วหมู', 50, 'เส้นใหญ่ผัดไฟแรง ไข่นุ่ม', 'photo-1600891964092-4316c288032e', false],
  ['res-khrua-yai', 'ต้มยำน้ำข้น', 70, 'รสจัดจ้าน เสิร์ฟร้อน ๆ ในหม้อไฟ', 'photo-1569562211093-4ed0d0758f12', false],
  ['res-ruea-nung', 'ก๋วยเตี๋ยวเรือหมูน้ำตก (ชามเล็ก)', 20, 'น้ำซุปเข้มข้น เลือกเส้นได้', 'photo-1555126634-323283e090fa', true],
  ['res-ruea-nung', 'ก๋วยเตี๋ยวเนื้อตุ๋น (ชามพิเศษ)', 60, 'เนื้อตุ๋นเปื่อยนุ่ม เครื่องเต็มชาม', 'photo-1547592180-85f173990554', true],
  ['res-ruea-nung', 'เย็นตาโฟทะเล', 55, 'ลูกชิ้นปลา ปลาหมึก กุ้ง เต้าหู้ทอด', 'photo-1585032226651-759b368d7246', false],
  ['res-dusit-brew', 'Dirty Latte', 85, 'เอสเปรสโซเข้ม ๆ ราดบนนมเย็น', 'photo-1461023058943-07fcbe16d735', true],
  ['res-dusit-brew', 'อเมริกาโน่เย็น', 65, 'เมล็ดคั่วกลางจากเชียงราย', 'photo-1517701550927-30cf4ba1dba5', true],
  ['res-dusit-brew', 'ชาไทยนมสด', 70, 'หวานน้อยได้ ใช้ชาแดงแท้', 'photo-1558857563-b371033873b8', false],
  ['res-dusit-brew', 'ครัวซองต์เนยสด', 60, 'อบใหม่ทุกเช้า ชั้นกรอบเนยหอม', 'photo-1555507036-ab1f4038808a', false],
  ['res-bualoy-pa-noi', 'บัวลอยไข่หวาน', 35, 'กะทิสดคั้นเอง ไข่หวานเยิ้ม', 'photo-1488477181946-6428a0291777', true],
  ['res-bualoy-pa-noi', 'รวมมิตรน้ำกะทิ', 40, 'ลอดช่อง เผือก ขนุน ครบเครื่อง', 'photo-1563729784474-d77dbb933a9e', true],
  ['res-bualoy-pa-noi', 'กล้วยบวชชี', 30, 'กล้วยน้ำว้าสุกกำลังดี', 'photo-1551024601-bec78aea704b', false],
  ['res-sdu-canteen', 'ข้าวราดแกง 2 อย่าง', 40, 'เลือกกับข้าวได้กว่า 10 อย่างทุกวัน', 'photo-1543353071-873f17a7a088', true],
  ['res-sdu-canteen', 'ข้าวมันไก่', 40, 'น้ำจิ้มเต้าเจี้ยวสูตรเฉพาะ', 'photo-1617093727343-374698b1b08d', true],
  ['res-sdu-canteen', 'ส้มตำไทยไข่เค็ม', 45, 'ตำสดทุกจาน เผ็ดได้ตามสั่ง', 'photo-1562565652-a0d8f0c59eb4', false],
]

export const seedMenus: Database['menus'] = menuRows.map(
  ([restaurantId, name, price, description, img, recommended], i) => ({
    id: `menu-${i + 1}`,
    restaurantId,
    name,
    price,
    description,
    image: photo(img, 640),
    recommended,
    createdAt: now,
  }),
)

const reviewRows: [string, string, number, string][] = [
  ['res-khrua-yai', 'ปอนด์ (นักศึกษาปี 3)', 5, 'กะเพราที่นี่หอมกระทะจริง ราคาไม่แพง อิ่มทุกครั้ง เที่ยงคนเยอะหน่อยแต่คุ้มค่ารอ'],
  ['res-khrua-yai', 'มายด์', 4, 'อร่อยดี แต่ถ้ามาช่วง 12.00 ต้องรอประมาณ 15 นาที แนะนำโทรสั่งล่วงหน้า'],
  ['res-ruea-nung', 'เจได', 5, 'สั่งทีละ 3 ชามยังไม่ถึงร้อย น้ำซุปเข้มข้นมาก ผักเติมได้ไม่อั้นด้วย'],
  ['res-ruea-nung', 'แนน', 5, 'เนื้อตุ๋นเปื่อยกำลังดี ชอบมาก มาบ่อยจนป้าจำได้แล้ว'],
  ['res-dusit-brew', 'ฟ้า', 4, 'นั่งติวได้ทั้งบ่าย ปลั๊กครบทุกโต๊ะ Wi-Fi ไม่หลุด กาแฟรสนุ่มดี'],
  ['res-dusit-brew', 'ต้นกล้า', 5, 'ชั้นบนเงียบมาก เหมาะกับทำโปรเจกต์ ครัวซองต์อบใหม่อร่อยเกินราคา'],
  ['res-bualoy-pa-noi', 'ใบเตย', 5, 'กะทิหอมมาก หวานกำลังดี ไม่เลี่ยน ซื้อกลับบ้านทุกวันศุกร์'],
  ['res-sdu-canteen', 'ภูมิ', 4, 'ราคาถูกที่สุดแถวนี้ มีให้เลือกเยอะ แต่ช่วงพักเที่ยงต้องแย่งที่นั่ง'],
  ['res-sdu-canteen', 'อิ๊ก', 4, 'ข้าวมันไก่คุ้มมาก 40 บาท น้ำจิ้มอร่อย แอร์เย็นสบาย'],
]

export const seedReviews: Database['reviews'] = reviewRows.map(
  ([restaurantId, author, rating, comment], i) => ({
    id: `rev-${i + 1}`,
    restaurantId,
    author,
    rating,
    comment,
    createdAt: now,
  }),
)

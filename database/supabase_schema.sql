-- =============================================================================
--  SUAN DUSIT FOOD GUIDE — PostgreSQL Schema สำหรับ Supabase
-- =============================================================================
--  วิธีใช้งาน:
--    1. เปิดหน้า Supabase Dashboard: https://supabase.com/dashboard/project/cpvtdcfnrmrcyhghrren
--    2. ไปที่เมนู "SQL Editor" ทางแถบซ้าย
--    3. คลิก "New query"
--    4. วางโค้ดทั้งหมดนี้ลงไป แล้วคลิกปุ่ม "Run" สีเขียว
-- =============================================================================

-- ลบตารางเดิมถ้ามีอยู่ (Reset)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS restaurant_images CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;

-- -----------------------------------------------------------------------------
--  1. categories — หมวดหมู่ร้านอาหาร
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'utensils',
  image       TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
--  2. restaurants — ข้อมูลร้านอาหาร
-- -----------------------------------------------------------------------------
CREATE TABLE restaurants (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  cover_image TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  price_min   INT NOT NULL DEFAULT 0,
  price_avg   INT NOT NULL DEFAULT 0,
  rating      NUMERIC(3,1) NOT NULL DEFAULT 0.0,
  open_time   TEXT NOT NULL DEFAULT '08:00',
  close_time  TEXT NOT NULL DEFAULT '17:00',
  open_days   TEXT[] NOT NULL DEFAULT '{}',
  phone       TEXT NOT NULL DEFAULT '',
  facebook    TEXT NOT NULL DEFAULT '',
  instagram   TEXT NOT NULL DEFAULT '',
  website     TEXT NOT NULL DEFAULT '',
  address     TEXT NOT NULL DEFAULT '',
  lat         DOUBLE PRECISION,
  lng         DOUBLE PRECISION,
  map_url     TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'open',
  featured    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
--  3. restaurant_images — รูปภาพประกอบร้าน
-- -----------------------------------------------------------------------------
CREATE TABLE restaurant_images (
  id            TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  caption       TEXT NOT NULL DEFAULT '',
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
--  4. menus — เมนูอาหารแนะนำ
-- -----------------------------------------------------------------------------
CREATE TABLE menus (
  id            TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  price         INT NOT NULL DEFAULT 0,
  description   TEXT NOT NULL DEFAULT '',
  image         TEXT NOT NULL DEFAULT '',
  recommended   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
--  5. reviews — ความคิดเห็นและรีวิว
-- -----------------------------------------------------------------------------
CREATE TABLE reviews (
  id            TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  author        TEXT NOT NULL,
  rating        INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
--  6. team_members — สมาชิกผู้จัดทำโครงงาน
-- -----------------------------------------------------------------------------
CREATE TABLE team_members (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  student_id  TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT '',
  faculty     TEXT NOT NULL DEFAULT '',
  major       TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT '',
  bio         TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
--  Row Level Security (RLS) & Policies
--  อนุญาตให้อ่านและเขียนข้อมูลได้ผ่าน Anon Public API Key ของเว็บ
-- -----------------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all restaurants" ON restaurants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all restaurant_images" ON restaurant_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all menus" ON menus FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
--  ใส่ข้อมูลเริ่มต้น (Seed Initial Data)
-- -----------------------------------------------------------------------------

-- หมวดหมู่
INSERT INTO categories (id, name, slug, description, icon, sort_order) VALUES
('cat-tamsang', 'อาหารตามสั่ง', 'tam-sang', 'ผัดกะเพรา ข้าวผัด ราดหน้า สั่งได้ทุกอย่างจานร้อน ๆ', 'wok', 1),
('cat-noodle', 'ก๋วยเตี๋ยว', 'noodle', 'ก๋วยเตี๋ยวเรือ เย็นตาโฟ บะหมี่ ต้มยำ น้ำใส', 'noodle', 2),
('cat-cafe', 'คาเฟ่', 'cafe', 'กาแฟ ชา ที่นั่งอ่านหนังสือ Wi-Fi แรง ปลั๊กครบ', 'coffee', 3),
('cat-dessert', 'ของหวาน', 'dessert', 'ขนมไทย บิงซู ไอศกรีม เบเกอรี่', 'dessert', 4),
('cat-budget', 'ร้านอาหารราคาประหยัด', 'budget', 'จานละไม่เกิน 50 บาท อิ่มครบทุกวัน', 'coin', 5),
('cat-near', 'ร้านอาหารใกล้มหาวิทยาลัย', 'near-campus', 'เดินถึงจากประตูมหาวิทยาลัยภายใน 5 นาที', 'pin', 6);

-- ร้านอาหาร
INSERT INTO restaurants (id, name, slug, cover_image, description, category_id, price_min, price_avg, rating, open_time, close_time, open_days, phone, facebook, instagram, address, lat, lng, featured) VALUES
('res-khrua-yai', 'ครัวคุณยาย ซอยระนอง', 'khrua-khun-yai', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=70', 'ร้านอาหารตามสั่งเจ้าเก่าในซอยระนอง เปิดมากว่า 20 ปี จุดเด่นคือกะเพราหมูสับไฟแรงกลิ่นหอมกระทะ และไข่ดาวกรอบ ๆ ที่ทอดสดทุกจาน ราคานักศึกษาจับต้องได้', 'cat-tamsang', 45, 60, 4.6, '07:00', '19:00', ARRAY['mon','tue','wed','thu','fri','sat'], '02-241-0111', 'https://www.facebook.com/', '', 'ซอยระนอง 2 แขวงถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300', 13.7768, 100.5203, true),
('res-ruea-nung', 'ก๋วยเตี๋ยวเรือ พี่หนุ่ม ท่าน้ำดุสิต', 'kuaytiao-ruea-pi-num', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=70', 'ก๋วยเตี๋ยวเรือน้ำตกสูตรอยุธยา น้ำซุปเข้มข้นเคี่ยวเองทุกเช้า เลือกเส้นได้ครบทั้งเส้นเล็ก เส้นใหญ่ บะหมี่ ชามเล็กราคาเบา ๆ', 'cat-noodle', 20, 45, 4.8, '08:00', '16:00', ARRAY['mon','tue','wed','thu','fri','sat','sun'], '089-222-3344', '', 'https://www.instagram.com/', 'ถนนสามเสน ใกล้ท่าน้ำเทเวศร์ เขตดุสิต กรุงเทพมหานคร 10300', 13.7739, 100.5058, true),
('res-dusit-brew', 'Dusit Brew Café', 'dusit-brew-cafe', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=70', 'คาเฟ่เล็ก ๆ บรรยากาศสงบ เหมาะกับการนั่งทำงานและติวหนังสือ มีปลั๊กไฟทุกโต๊ะ Wi-Fi เร็ว และโซนเงียบชั้นบน เมล็ดกาแฟคั่วเองจากเชียงราย', 'cat-cafe', 55, 95, 4.5, '08:30', '20:00', ARRAY['mon','tue','wed','thu','fri','sat','sun'], '02-668-7788', 'https://www.facebook.com/', 'https://www.instagram.com/', '128 ถนนนครราชสีมา แขวงดุสิต เขตดุสิต กรุงเทพมหานคร 10300', 13.7781, 100.5171, true),
('res-bualoy-pa-noi', 'บัวลอยป้าน้อย', 'bualoy-pa-noi', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=70', 'ขนมไทยหน้าตลาด ขายบัวลอยไข่หวาน กล้วยบวชชี และรวมมิตรน้ำกะทิสด ทำใหม่ทุกวันไม่ใส่สารกันบูด กะทิหอมมันไม่หวานแหลม', 'cat-dessert', 25, 40, 4.7, '10:00', '18:00', ARRAY['tue','wed','thu','fri','sat','sun'], '081-555-6677', '', '', 'ตลาดศรีย่าน ถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300', 13.7795, 100.5138, false),
('res-sdu-canteen', 'โรงอาหารกลาง สวนดุสิต', 'sdu-central-canteen', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=70', 'โรงอาหารในมหาวิทยาลัย รวมร้านค้ากว่า 15 ร้านไว้ในที่เดียว ทั้งข้าวราดแกง ก๋วยเตี๋ยว ส้มตำ ข้าวมันไก่ ราคาเริ่มต้น 30 บาท', 'cat-budget', 30, 45, 4.2, '07:00', '17:00', ARRAY['mon','tue','wed','thu','fri'], '02-244-5555', '', '', 'มหาวิทยาลัยสวนดุสิต 295 ถนนนครราชสีมา เขตดุสิต กรุงเทพมหานคร 10300', 13.7772, 100.5186, true);

-- เมนูอาหาร
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES
('menu-1', 'res-khrua-yai', 'กะเพราหมูสับไข่ดาว', 55, 'ไฟแรงกลิ่นหอมกระทะ เผ็ดได้ตามสั่ง', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=640&q=70', true),
('menu-2', 'res-khrua-yai', 'ข้าวผัดกุ้ง', 65, 'กุ้งสด 5 ตัว เสิร์ฟพร้อมมะนาวและแตงกวา', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=640&q=70', true),
('menu-3', 'res-khrua-yai', 'ผัดซีอิ๊วหมู', 50, 'เส้นใหญ่ผัดไฟแรง ไข่นุ่ม', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=640&q=70', false),
('menu-4', 'res-ruea-nung', 'ก๋วยเตี๋ยวเรือหมูน้ำตก (ชามเล็ก)', 20, 'น้ำซุปเข้มข้น เลือกเส้นได้', 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=640&q=70', true),
('menu-5', 'res-ruea-nung', 'ก๋วยเตี๋ยวเนื้อตุ๋น (ชามพิเศษ)', 60, 'เนื้อตุ๋นเปื่อยนุ่ม เครื่องเต็มชาม', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=640&q=70', true),
('menu-6', 'res-dusit-brew', 'Dirty Latte', 85, 'เอสเปรสโซเข้ม ๆ ราดบนนมเย็น', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=640&q=70', true),
('menu-7', 'res-dusit-brew', 'อเมริกาโน่เย็น', 65, 'เมล็ดคั่วกลางจากเชียงราย', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=640&q=70', true),
('menu-8', 'res-bualoy-pa-noi', 'บัวลอยไข่หวาน', 35, 'กะทิสดคั้นเอง ไข่หวานเยิ้ม', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=640&q=70', true),
('menu-9', 'res-sdu-canteen', 'ข้าวราดแกง 2 อย่าง', 40, 'เลือกกับข้าวได้กว่า 10 อย่างทุกวัน', 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=640&q=70', true);

-- สมาชิกผู้จัดทำ
INSERT INTO team_members (id, name, student_id, role, faculty, major, bio, sort_order) VALUES
('member-1', 'นายกิตติศักดิ์ พัฒนกิจ', '6611011340001', 'หัวหน้าโครงการ & พัฒนาเว็บไซต์', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'วิทยาการคอมพิวเตอร์', 'รับผิดชอบการออกแบบสถาปัตยกรรมระบบ พัฒนา Web Application และดูแลฐานข้อมูลร้านอาหาร', 1),
('member-2', 'นางสาวธนภรณ์ ศรีสุข', '6611011340002', 'ออกแบบ UI/UX & รวบรวมข้อมูล', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'วิทยาการคอมพิวเตอร์', 'รับผิดชอบการออกแบบหน้าจอและประสานงานสำรวจร้านอาหารรอบมหาวิทยาลัยสวนดุสิต', 2),
('member-3', 'นายวรเมธ วงศ์สว่าง', '6611011340003', 'ถ่ายภาพ & จัดเตรียมเนื้อหา', 'โรงเรียนการเรือน', 'เทคโนโลยีการประกอบอาหารและการบริการ', 'รับผิดชอบการลงพื้นที่ถ่ายภาพร้านอาหาร เมนูแนะนำ และทดสอบระบบ', 3);

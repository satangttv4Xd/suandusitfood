-- =============================================================================
--  SUAN DUSIT FOOD GUIDE — PostgreSQL Schema สำหรับ Supabase (Real Production Data)
-- =============================================================================
--  วิธีใช้งาน:
--    1. เปิดหน้า Supabase Dashboard: https://supabase.com/dashboard/project/cpvtdcfnrmrcyhghrren
--    2. ไปที่เมนู "SQL Editor" ทางแถบซ้าย
--    3. คลิก "New query"
--    4. วางโค้ดทั้งหมดนี้ลงไป แล้วคลิกปุ่ม "Run" สีเขียว
-- =============================================================================

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS menus CASCADE;
DROP TABLE IF EXISTS restaurant_images CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;

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

CREATE TABLE restaurant_images (
  id            TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  caption       TEXT NOT NULL DEFAULT '',
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE reviews (
  id            TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  author        TEXT NOT NULL,
  rating        INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- Categories
INSERT INTO categories (id, name, slug, description, icon, image, sort_order) VALUES ('cat-tamsang', 'อาหารตามสั่ง', 'tam-sang', 'ผัดกะเพรา ข้าวผัด ราดหน้า สั่งได้ทุกอย่างจานร้อน ๆ', 'wok', '', 1);
INSERT INTO categories (id, name, slug, description, icon, image, sort_order) VALUES ('cat-noodle', 'ก๋วยเตี๋ยว', 'noodle', 'ก๋วยเตี๋ยวเรือ เย็นตาโฟ บะหมี่ ต้มยำ น้ำใส', 'noodle', '', 2);
INSERT INTO categories (id, name, slug, description, icon, image, sort_order) VALUES ('cat-cafe', 'คาเฟ่', 'cafe', 'กาแฟ ชา ที่นั่งอ่านหนังสือ Wi-Fi แรง ปลั๊กครบ', 'coffee', '', 3);
INSERT INTO categories (id, name, slug, description, icon, image, sort_order) VALUES ('cat-dessert', 'ของหวาน', 'dessert', 'ขนมไทย บิงซู ไอศกรีม เบเกอรี่', 'dessert', '', 4);
INSERT INTO categories (id, name, slug, description, icon, image, sort_order) VALUES ('cat-budget', 'ร้านอาหารราคาประหยัด', 'budget', 'จานละไม่เกิน 50 บาท อิ่มครบทุกวัน', 'coin', '', 5);
INSERT INTO categories (id, name, slug, description, icon, image, sort_order) VALUES ('cat-near', 'ร้านอาหารใกล้มหาวิทยาลัย', 'near-campus', 'เดินถึงจากประตูมหาวิทยาลัยภายใน 5 นาที', 'pin', '', 6);

-- Restaurants
INSERT INTO restaurants (id, name, slug, cover_image, description, category_id, price_min, price_avg, rating, open_time, close_time, open_days, phone, facebook, instagram, website, address, lat, lng, status, featured) VALUES ('res-khrua-yai', 'ข้าวมันไก่ อาคาร11', 'khrua-khun-yai', '/uploads/res-1-mufsvrlw-n8q4.webp', 'ข้าวมันไก่ ตึก11  มีไก่ให้เลือก3แบบ ไก่ต้ม ไก่ย่าง ไก่ทอด  เพิ่มข้าว 5 บาท แม่ค้าน่ารักนิสัยดี น้ำซุปกลมกล่อม ไก่ทอดกรอบ ไก่ย่างหอม  นำไก่มาผสมได้', 'cat-tamsang', 45, 50, 4.6, '07:00', '16:00', ARRAY['mon','tue','wed','thu','fri','sat'], '02-241-0111', 'https://www.facebook.com/', '', '', 'ซอยระนอง 2 แขวงถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300', 13.7768, 100.5203, 'open', true);
INSERT INTO restaurants (id, name, slug, cover_image, description, category_id, price_min, price_avg, rating, open_time, close_time, open_days, phone, facebook, instagram, website, address, lat, lng, status, featured) VALUES ('res-ruea-nung', 'Nobicha (โนบิชา)', 'kuaytiao-ruea-pi-num', '/uploads/res-2-mufsvrlw-39dc.webp', 'ชารสเข้มข้นราคาประหยัด ไข่มุกหนึบเคี้ยวอร่อย รอคิวไม่นาน', 'cat-cafe', 30, 35, 4.8, '08:00', '16:00', ARRAY['mon','tue','wed','thu','fri','sat','sun'], '089-222-3344', '', 'https://www.instagram.com/', '', 'ถนนสามเสน ใกล้ท่าน้ำเทเวศร์ เขตดุสิต กรุงเทพมหานคร 10300', 13.7739, 100.5058, 'open', true);
INSERT INTO restaurants (id, name, slug, cover_image, description, category_id, price_min, price_avg, rating, open_time, close_time, open_days, phone, facebook, instagram, website, address, lat, lng, status, featured) VALUES ('res-dusit-brew', '295 meeting point (ซุ้มเขียว)', 'dusit-brew-cafe', '/uploads/res-3-mufsvrlx-sb5a.webp', '295 meeting point (ซุ้มเขียว) ร้านอาหารราคาประหยัด ไข่เจียวทอดใหม่ทุกฟอง หอมอร่อย', 'cat-budget', 25, 50, 5, '08:30', '16:00', ARRAY['mon','tue','wed','thu','fri'], '02-668-7788', 'https://www.facebook.com/', 'https://www.instagram.com/', 'https://example.com/', '128 ถนนนครราชสีมา แขวงดุสิต เขตดุสิต กรุงเทพมหานคร 10300', 13.7781, 100.5171, 'open', true);
INSERT INTO restaurants (id, name, slug, cover_image, description, category_id, price_min, price_avg, rating, open_time, close_time, open_days, phone, facebook, instagram, website, address, lat, lng, status, featured) VALUES ('res-bualoy-pa-noi', 'Home Bakery', 'bualoy-pa-noi', '/uploads/res-4-mufsvrlx-mmqy.webp', 'Home Bakery สวนดุสิต ร้านเบเกอรี่ภายในมหาวิทยาลัยสวนดุสิต มีขนมอบและเบเกอรี่หลากหลาย เหมาะสำหรับนักศึกษา บุคลากร และผู้ที่ต้องการซื้อขนมรับประทานในระหว่างวัน จุดเด่นคือรสชาติอร่อย ราคาเข้าถึงง่าย และมีเมนูให้เลือกหลากหลาย', 'cat-dessert', 30, 40, 4.7, '10:00', '18:00', ARRAY['tue','wed','thu','fri','sat','sun'], '081-555-6677', '', '', '', 'ตลาดศรีย่าน ถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300', 13.7795, 100.5138, 'open', true);
INSERT INTO restaurants (id, name, slug, cover_image, description, category_id, price_min, price_avg, rating, open_time, close_time, open_days, phone, facebook, instagram, website, address, lat, lng, status, featured) VALUES ('res-sdu-canteen', 'ร้านพิซ่า อาคาร12', 'sdu-central-canteen', '/uploads/res-5-mufsvrlx-lp7v.webp', 'ร้านพิซซ่าในอาคาร12ทำใหม่ทุกชิ้น อบใหม่หอมอร่อยราคานักศึกษา', 'cat-cafe', 45, 60, 4.2, '07:00', '17:00', ARRAY['mon','tue','wed','thu','fri'], '02-244-5555', '', '', 'https://www.dusit.ac.th/', 'มหาวิทยาลัยสวนดุสิต 295 ถนนนครราชสีมา เขตดุสิต กรุงเทพมหานคร 10300', 13.7772, 100.5186, 'open', true);

-- Restaurant Images
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufmmzpm-fwpnp8', 'res-khrua-yai', '/uploads/gallery-1-mufsvrly-udua.webp', '', 0);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufmmzpm-b3baoi', 'res-khrua-yai', '/uploads/gallery-2-mufsvrlz-c0oy.webp', '', 1);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufmq1ip-3bnn64', 'res-ruea-nung', '/uploads/gallery-3-mufsvrm0-1rms.webp', '', 0);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufmq1ip-ihuqqh', 'res-ruea-nung', '/uploads/gallery-4-mufsvrm1-4o69.webp', '', 1);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufmu0dd-z161ff', 'res-dusit-brew', '/uploads/gallery-5-mufsvrm1-lkwk.webp', '', 0);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufmu0dd-y3qrn4', 'res-dusit-brew', '/uploads/gallery-6-mufsvrm1-v6ig.webp', '', 1);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufmu0dd-biw8q8', 'res-dusit-brew', '/uploads/gallery-7-mufsvrm2-s7rh.webp', '', 2);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufna5n5-bz1p4w', 'res-bualoy-pa-noi', '/uploads/gallery-8-mufsvrm2-jovw.webp', '', 0);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufna5n6-7qqyct', 'res-bualoy-pa-noi', '/uploads/gallery-9-mufsvrm2-00a3.webp', '', 1);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufna5n6-xuanum', 'res-bualoy-pa-noi', '/uploads/gallery-10-mufsvrm3-z4yt.webp', '', 2);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufnipf6-6md513', 'res-sdu-canteen', '/uploads/gallery-11-mufsvrm3-6vua.webp', '', 0);
INSERT INTO restaurant_images (id, restaurant_id, url, caption, sort_order) VALUES ('img-mufnipf6-z1g148', 'res-sdu-canteen', '/uploads/gallery-12-mufsvrm3-0e10.webp', '', 1);

-- Menus
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-1', 'res-khrua-yai', 'กะเพราหมูสับไข่ดาว', 55, 'ไฟแรงกลิ่นหอมกระทะ เผ็ดได้ตามสั่ง', 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-2', 'res-khrua-yai', 'ข้าวผัดกุ้ง', 65, 'กุ้งสด 5 ตัว เสิร์ฟพร้อมมะนาวและแตงกวา', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-3', 'res-khrua-yai', 'ผัดซีอิ๊วหมู', 50, 'เส้นใหญ่ผัดไฟแรง ไข่นุ่ม', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=640&q=70', false);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-4', 'res-khrua-yai', 'ต้มยำน้ำข้น', 70, 'รสจัดจ้าน เสิร์ฟร้อน ๆ ในหม้อไฟ', 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?auto=format&fit=crop&w=640&q=70', false);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-5', 'res-ruea-nung', 'ก๋วยเตี๋ยวเรือหมูน้ำตก (ชามเล็ก)', 20, 'น้ำซุปเข้มข้น เลือกเส้นได้', 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-6', 'res-ruea-nung', 'ก๋วยเตี๋ยวเนื้อตุ๋น (ชามพิเศษ)', 60, 'เนื้อตุ๋นเปื่อยนุ่ม เครื่องเต็มชาม', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-7', 'res-ruea-nung', 'เย็นตาโฟทะเล', 55, 'ลูกชิ้นปลา ปลาหมึก กุ้ง เต้าหู้ทอด', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=640&q=70', false);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-8', 'res-dusit-brew', 'Dirty Latte', 85, 'เอสเปรสโซเข้ม ๆ ราดบนนมเย็น', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-9', 'res-dusit-brew', 'อเมริกาโน่เย็น', 65, 'เมล็ดคั่วกลางจากเชียงราย', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-10', 'res-dusit-brew', 'ชาไทยนมสด', 70, 'หวานน้อยได้ ใช้ชาแดงแท้', 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=640&q=70', false);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-11', 'res-dusit-brew', 'ครัวซองต์เนยสด', 60, 'อบใหม่ทุกเช้า ชั้นกรอบเนยหอม', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=640&q=70', false);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-12', 'res-bualoy-pa-noi', 'บัวลอยไข่หวาน', 35, 'กะทิสดคั้นเอง ไข่หวานเยิ้ม', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-13', 'res-bualoy-pa-noi', 'รวมมิตรน้ำกะทิ', 40, 'ลอดช่อง เผือก ขนุน ครบเครื่อง', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-14', 'res-bualoy-pa-noi', 'กล้วยบวชชี', 30, 'กล้วยน้ำว้าสุกกำลังดี', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=640&q=70', false);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-15', 'res-sdu-canteen', 'ข้าวราดแกง 2 อย่าง', 40, 'เลือกกับข้าวได้กว่า 10 อย่างทุกวัน', 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-16', 'res-sdu-canteen', 'ข้าวมันไก่', 40, 'น้ำจิ้มเต้าเจี้ยวสูตรเฉพาะ', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=640&q=70', true);
INSERT INTO menus (id, restaurant_id, name, price, description, image, recommended) VALUES ('menu-17', 'res-sdu-canteen', 'ส้มตำไทยไข่เค็ม', 45, 'ตำสดทุกจาน เผ็ดได้ตามสั่ง', 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=640&q=70', false);

-- Reviews
INSERT INTO reviews (id, restaurant_id, author, rating, comment) VALUES ('rev-1', 'res-khrua-yai', 'ปอนด์ (นักศึกษาปี 3)', 5, 'กะเพราที่นี่หอมกระทะจริง ราคาไม่แพง อิ่มทุกครั้ง เที่ยงคนเยอะหน่อยแต่คุ้มค่ารอ');
INSERT INTO reviews (id, restaurant_id, author, rating, comment) VALUES ('rev-2', 'res-khrua-yai', 'มายด์', 4, 'อร่อยดี แต่ถ้ามาช่วง 12.00 ต้องรอประมาณ 15 นาที แนะนำโทรสั่งล่วงหน้า');
INSERT INTO reviews (id, restaurant_id, author, rating, comment) VALUES ('rev-3', 'res-ruea-nung', 'เจได', 5, 'สั่งทีละ 3 ชามยังไม่ถึงร้อย น้ำซุปเข้มข้นมาก ผักเติมได้ไม่อั้นด้วย');
INSERT INTO reviews (id, restaurant_id, author, rating, comment) VALUES ('rev-4', 'res-ruea-nung', 'แนน', 5, 'เนื้อตุ๋นเปื่อยกำลังดี ชอบมาก มาบ่อยจนป้าจำได้แล้ว');
INSERT INTO reviews (id, restaurant_id, author, rating, comment) VALUES ('rev-5', 'res-dusit-brew', 'ฟ้า', 4, 'นั่งติวได้ทั้งบ่าย ปลั๊กครบทุกโต๊ะ Wi-Fi ไม่หลุด กาแฟรสนุ่มดี');
INSERT INTO reviews (id, restaurant_id, author, rating, comment) VALUES ('rev-6', 'res-dusit-brew', 'ต้นกล้า', 5, 'ชั้นบนเงียบมาก เหมาะกับทำโปรเจกต์ ครัวซองต์อบใหม่อร่อยเกินราคา');
INSERT INTO reviews (id, restaurant_id, author, rating, comment) VALUES ('rev-7', 'res-bualoy-pa-noi', 'ใบเตย', 5, 'กะทิหอมมาก หวานกำลังดี ไม่เลี่ยน ซื้อกลับบ้านทุกวันศุกร์');
INSERT INTO reviews (id, restaurant_id, author, rating, comment) VALUES ('rev-8', 'res-sdu-canteen', 'ภูมิ', 4, 'ราคาถูกที่สุดแถวนี้ มีให้เลือกเยอะ แต่ช่วงพักเที่ยงต้องแย่งที่นั่ง');
INSERT INTO reviews (id, restaurant_id, author, rating, comment) VALUES ('rev-9', 'res-sdu-canteen', 'อิ๊ก', 4, 'ข้าวมันไก่คุ้มมาก 40 บาท น้ำจิ้มอร่อย แอร์เย็นสบาย');

-- Team Members
INSERT INTO team_members (id, name, student_id, role, faculty, major, image, bio, sort_order) VALUES ('member-1', 'นาย นภัสพล ผู้แสนสะอาด', '6911011662002', 'หัวหน้าโครงการ & พัฒนาเว็บไซต์', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'ความมั่นคงปลอดภัยไซเบอร์', '/uploads/team-1-mufsvrlu-va4k.webp', 'รับผิดชอบการออกแบบสถาปัตยกรรมระบบ พัฒนา Web Application และดูแลฐานข้อมูลร้านอาหาร', 1);
INSERT INTO team_members (id, name, student_id, role, faculty, major, image, bio, sort_order) VALUES ('member-2', 'นายจาวา เรือง', '6611011340002', 'ออกแบบ UI/UX & รวบรวมข้อมูล', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'ความมั่นคงปลอดภัยไซเบอร์', '/uploads/team-2-mufsvrlv-6mw6.webp', 'รับผิดชอบการออกแบบหน้าจอและประสานงานสำรวจร้านอาหารรอบมหาวิทยาลัยสวนดุสิต', 2);
INSERT INTO team_members (id, name, student_id, role, faculty, major, image, bio, sort_order) VALUES ('member-3', 'นายยูอุตะ ยามาดะ', '69110116620011', 'ถ่ายภาพ & จัดเตรียมเนื้อหา', 'โรงเรียนการเรือน', 'ความมั่นคงปลอดภัยไซเบอร์', '/uploads/team-3-mufsvrlv-m1iz.webp', 'รับผิดชอบการลงพื้นที่ถ่ายภาพร้านอาหาร เมนูแนะนำ และทดสอบระบบ', 3);
INSERT INTO team_members (id, name, student_id, role, faculty, major, image, bio, sort_order) VALUES ('member-mufox9m5-h6a4ln', 'นายทศวรรษ คำบุญเรือง', '6911011662009', 'สมาชิก', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'ความมั่นคงปลอดภัยไซเบอร์', '', '', 4);
INSERT INTO team_members (id, name, student_id, role, faculty, major, image, bio, sort_order) VALUES ('member-mufoy7f7-5e5j32', 'นายกนกณัฐ พูลสมบัติ', '6911011662010', 'สมาชิก', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'ความมั่นคงปลอดภัยไซเบอร์', '/uploads/team-5-mufsvrlv-u515.webp', '', 5);

-- =============================================================================
--  SUAN DUSIT FOOD GUIDE — โครงสร้างฐานข้อมูล (MySQL 8 / MariaDB 10.4+)
-- =============================================================================
--
--  เว็บไซต์ชุดนี้ทำงานด้วย localStorage ของเบราว์เซอร์ ไม่ต้องติดตั้ง MySQL
--  ก็ใช้งานได้ทันที ไฟล์นี้คือ "พิมพ์เขียว" ของฐานข้อมูลจริง ซึ่งมีโครงสร้าง
--  ตรงกับ TypeScript interface ใน src/lib/types.ts แบบหนึ่งต่อหนึ่ง
--
--  ใช้ไฟล์นี้เมื่อ:
--    1) ต้องส่งเป็นเอกสาร ER Diagram / โครงสร้างฐานข้อมูลของโปรเจกต์
--    2) ต้องการย้ายระบบไปใช้ backend จริง — เขียน REST API ตามตารางนี้
--       แล้วแก้เฉพาะไฟล์ src/lib/db.ts ให้เรียก fetch() แทน localStorage
--       โดยไม่ต้องแตะโค้ดหน้าเว็บแม้แต่บรรทัดเดียว
--
--  วิธี import:
--    mysql -u root -p < database/database.sql
--    หรือเปิด phpMyAdmin → Import → เลือกไฟล์นี้
--
--  ความสัมพันธ์:
--    categories   1 ──< restaurants        (ลบหมวดหมู่ → ร้านยังอยู่ categoryId = NULL)
--    restaurants  1 ──< menus              (ลบร้าน → ลบเมนูตาม)
--    restaurants  1 ──< restaurant_images  (ลบร้าน → ลบรูปตาม)
--    restaurants  1 ──< reviews            (ลบร้าน → ลบรีวิวตาม)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `suandusitfood`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `suandusitfood`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `menus`;
DROP TABLE IF EXISTS `restaurant_images`;
DROP TABLE IF EXISTS `restaurants`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
--  users — บัญชีผู้ดูแลระบบ
-- -----------------------------------------------------------------------------
--  password_hash เก็บเป็นค่าแฮชเท่านั้น ห้ามเก็บรหัสผ่านจริง
--  ฝั่ง PHP ใช้ password_hash($pw, PASSWORD_DEFAULT) / password_verify()
--  ฝั่ง JS ในโปรเจกต์นี้ใช้ PBKDF2-SHA256 150,000 รอบ + salt สุ่มต่อบัญชี
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id`            VARCHAR(64)  NOT NULL,
  `username`      VARCHAR(60)  NOT NULL,
  `display_name`  VARCHAR(120) NOT NULL DEFAULT 'ผู้ดูแลระบบ',
  `password_hash` VARCHAR(255) NOT NULL,
  `salt`          VARCHAR(64)  NOT NULL DEFAULT '',
  `role`          ENUM('admin') NOT NULL DEFAULT 'admin',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
--  categories — หมวดหมู่ร้านอาหาร
-- -----------------------------------------------------------------------------
--  icon  = ชื่อไอคอน SVG ที่มากับระบบ (wok, noodle, coffee, dessert, coin, pin …)
--  image = path รูปไอคอนที่แอดมินอัปโหลดเอง ถ้ามีจะถูกใช้แทน icon
-- -----------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id`          VARCHAR(64)  NOT NULL,
  `name`        VARCHAR(120) NOT NULL,
  `slug`        VARCHAR(140) NOT NULL,
  `description` VARCHAR(255) NOT NULL DEFAULT '',
  `icon`        VARCHAR(40)  NOT NULL DEFAULT 'utensils',
  `image`       VARCHAR(255) NOT NULL DEFAULT '',
  `sort_order`  INT          NOT NULL DEFAULT 0,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`),
  KEY `ix_categories_sort` (`sort_order`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
--  restaurants — ข้อมูลร้านอาหาร
-- -----------------------------------------------------------------------------
--  open_days เก็บเป็น SET เพื่อให้ query "ร้านที่เปิดวันเสาร์" ได้ตรง ๆ:
--      SELECT * FROM restaurants WHERE FIND_IN_SET('sat', open_days);
--  rating    = คะแนนตั้งต้นที่แอดมินกรอก ใช้เมื่อยังไม่มีรีวิว
--              ถ้ามีรีวิวแล้ว หน้าเว็บจะคำนวณค่าเฉลี่ยจากตาราง reviews แทน
--  status    = การปิดชั่วคราวที่แอดมินสั่งเอง (ปิดปรับปรุง / ปิดยาว)
--              มีศักดิ์เหนือกว่าเวลาทำการเสมอ
-- -----------------------------------------------------------------------------
CREATE TABLE `restaurants` (
  `id`          VARCHAR(64)  NOT NULL,
  `name`        VARCHAR(160) NOT NULL,
  `slug`        VARCHAR(180) NOT NULL,
  `cover_image` VARCHAR(255) NOT NULL DEFAULT '',
  `description` TEXT         NOT NULL,
  `category_id` VARCHAR(64)  NULL,
  `price_min`   INT UNSIGNED NOT NULL DEFAULT 0,
  `price_avg`   INT UNSIGNED NOT NULL DEFAULT 0,
  `rating`      DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  `open_time`   TIME         NOT NULL DEFAULT '08:00:00',
  `close_time`  TIME         NOT NULL DEFAULT '18:00:00',
  `open_days`   SET('mon','tue','wed','thu','fri','sat','sun')
                NOT NULL DEFAULT 'mon,tue,wed,thu,fri',
  `phone`       VARCHAR(40)  NOT NULL DEFAULT '',
  `facebook`    VARCHAR(255) NOT NULL DEFAULT '',
  `instagram`   VARCHAR(255) NOT NULL DEFAULT '',
  `website`     VARCHAR(255) NOT NULL DEFAULT '',
  `address`     VARCHAR(500) NOT NULL DEFAULT '',
  `lat`         DECIMAL(10,7) NULL,
  `lng`         DECIMAL(10,7) NULL,
  `map_url`     VARCHAR(500) NOT NULL DEFAULT '',
  `status`      ENUM('open','closed') NOT NULL DEFAULT 'open',
  `featured`    TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_restaurants_slug` (`slug`),
  KEY `ix_restaurants_category` (`category_id`),
  KEY `ix_restaurants_featured` (`featured`, `rating`),
  KEY `ix_restaurants_created` (`created_at`),
  FULLTEXT KEY `ft_restaurants_search` (`name`, `description`, `address`),
  CONSTRAINT `fk_restaurants_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
--  restaurant_images — แกลเลอรีรูปเพิ่มเติมของแต่ละร้าน
-- -----------------------------------------------------------------------------
--  เก็บเฉพาะ path ของไฟล์ (เช่น admin/uploads/res-01-a7f3.webp)
--  ตัวไฟล์จริงอยู่ในโฟลเดอร์ uploads/ ไม่เก็บ binary ลงฐานข้อมูล
-- -----------------------------------------------------------------------------
CREATE TABLE `restaurant_images` (
  `id`            VARCHAR(64)  NOT NULL,
  `restaurant_id` VARCHAR(64)  NOT NULL,
  `url`           VARCHAR(255) NOT NULL,
  `caption`       VARCHAR(200) NOT NULL DEFAULT '',
  `sort_order`    INT          NOT NULL DEFAULT 0,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_images_restaurant` (`restaurant_id`, `sort_order`),
  CONSTRAINT `fk_images_restaurant`
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
--  menus — เมนูอาหารของแต่ละร้าน
-- -----------------------------------------------------------------------------
CREATE TABLE `menus` (
  `id`            VARCHAR(64)  NOT NULL,
  `restaurant_id` VARCHAR(64)  NOT NULL,
  `name`          VARCHAR(160) NOT NULL,
  `price`         INT UNSIGNED NOT NULL DEFAULT 0,
  `description`   VARCHAR(500) NOT NULL DEFAULT '',
  `image`         VARCHAR(255) NOT NULL DEFAULT '',
  `recommended`   TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_menus_restaurant` (`restaurant_id`, `recommended`),
  CONSTRAINT `fk_menus_restaurant`
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
--  reviews — รีวิวจากผู้เข้าชม
-- -----------------------------------------------------------------------------
--  ไม่มีคอลัมน์ user_id เพราะผู้เข้าชมรีวิวได้โดยไม่ต้องสมัครสมาชิก
--  แอดมินลบรีวิวที่ไม่เหมาะสมได้จากหน้า /admin/reviews
-- -----------------------------------------------------------------------------
CREATE TABLE `reviews` (
  `id`            VARCHAR(64)  NOT NULL,
  `restaurant_id` VARCHAR(64)  NOT NULL,
  `author`        VARCHAR(80)  NOT NULL,
  `rating`        TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `comment`       VARCHAR(600) NOT NULL DEFAULT '',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_reviews_restaurant` (`restaurant_id`, `created_at`),
  CONSTRAINT `fk_reviews_restaurant`
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ck_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
--  team_members — ข้อมูลสมาชิกผู้จัดทำโครงงาน (วิชาพลังสวนดุสิต)
-- -----------------------------------------------------------------------------
CREATE TABLE `team_members` (
  `id`          VARCHAR(64)   NOT NULL,
  `name`        VARCHAR(120)  NOT NULL,
  `student_id`  VARCHAR(30)   NOT NULL DEFAULT '',
  `role`        VARCHAR(120)  NOT NULL DEFAULT '',
  `faculty`     VARCHAR(150)  NOT NULL DEFAULT '',
  `image`       MEDIUMTEXT    NOT NULL,
  `bio`         TEXT          NOT NULL,
  `sort_order`  INT           NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- =============================================================================
--  ข้อมูลตัวอย่าง — ตรงกับชุดที่มากับเว็บไซต์ (src/lib/seed.ts)
--  ทุกแถวเป็นข้อมูลปกติ แอดมินแก้ไขหรือลบได้ทั้งหมด
-- =============================================================================

-- บัญชีเริ่มต้น: admin / admin123
-- (ค่าแฮชด้านล่างสร้างด้วย password_hash('admin123', PASSWORD_DEFAULT) ของ PHP
--  ให้เปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบครั้งแรก)
INSERT INTO `users` (`id`, `username`, `display_name`, `password_hash`, `salt`) VALUES
('user-admin', 'admin', 'ผู้ดูแลระบบ',
 '$2y$10$e0NRl8sYK1q1DkRiOZ7YcOx1L7Bj2eVYbCk3eUu4Q5tGZBiNjZ0Iu', '');

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `sort_order`) VALUES
('cat-tamsang', 'อาหารตามสั่ง',              'tam-sang',    'ผัดกะเพรา ข้าวผัด ราดหน้า สั่งได้ทุกอย่างจานร้อน ๆ',  'wok',     1),
('cat-noodle',  'ก๋วยเตี๋ยว',                 'noodle',      'ก๋วยเตี๋ยวเรือ เย็นตาโฟ บะหมี่ ต้มยำ น้ำใส',           'noodle',  2),
('cat-cafe',    'คาเฟ่',                      'cafe',        'กาแฟ ชา ที่นั่งอ่านหนังสือ Wi-Fi แรง ปลั๊กครบ',        'coffee',  3),
('cat-dessert', 'ของหวาน',                   'dessert',     'ขนมไทย บิงซู ไอศกรีม เบเกอรี่',                        'dessert', 4),
('cat-budget',  'ร้านอาหารราคาประหยัด',        'budget',      'จานละไม่เกิน 50 บาท อิ่มครบทุกวัน',                    'coin',    5),
('cat-near',    'ร้านอาหารใกล้มหาวิทยาลัย',    'near-campus', 'เดินถึงจากประตูมหาวิทยาลัยภายใน 5 นาที',                'pin',     6);

INSERT INTO `restaurants`
  (`id`, `name`, `slug`, `description`, `category_id`, `price_min`, `price_avg`,
   `rating`, `open_time`, `close_time`, `open_days`, `phone`, `address`, `lat`, `lng`,
   `status`, `featured`)
VALUES
('res-khrua-yai', 'ครัวคุณยาย ซอยระนอง', 'khrua-khun-yai',
 'ร้านอาหารตามสั่งเจ้าเก่าในซอยระนอง เปิดมากว่า 20 ปี จุดเด่นคือกะเพราหมูสับไฟแรงกลิ่นหอมกระทะ ราคานักศึกษาจับต้องได้',
 'cat-tamsang', 45, 60, 4.6, '07:00:00', '19:00:00', 'mon,tue,wed,thu,fri,sat',
 '02-241-0111', 'ซอยระนอง 2 แขวงถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300',
 13.7768000, 100.5203000, 'open', 1),

('res-ruea-nung', 'ก๋วยเตี๋ยวเรือ พี่หนุ่ม ท่าน้ำดุสิต', 'kuaytiao-ruea-pi-num',
 'ก๋วยเตี๋ยวเรือน้ำตกสูตรอยุธยา น้ำซุปเข้มข้นเคี่ยวเองทุกเช้า ชามเล็กราคาเบา ๆ สั่งได้หลายชามไม่เปลืองกระเป๋า',
 'cat-noodle', 20, 45, 4.8, '08:00:00', '16:00:00', 'mon,tue,wed,thu,fri,sat,sun',
 '089-222-3344', 'ถนนสามเสน ใกล้ท่าน้ำเทเวศร์ เขตดุสิต กรุงเทพมหานคร 10300',
 13.7739000, 100.5058000, 'open', 1),

('res-dusit-brew', 'Dusit Brew Café', 'dusit-brew-cafe',
 'คาเฟ่เล็ก ๆ บรรยากาศสงบ เหมาะกับการนั่งทำงานและติวหนังสือ มีปลั๊กไฟทุกโต๊ะ Wi-Fi เร็ว และโซนเงียบชั้นบน',
 'cat-cafe', 55, 95, 4.5, '08:30:00', '20:00:00', 'mon,tue,wed,thu,fri,sat,sun',
 '02-668-7788', '128 ถนนนครราชสีมา แขวงดุสิต เขตดุสิต กรุงเทพมหานคร 10300',
 13.7781000, 100.5171000, 'open', 1),

('res-bualoy-pa-noi', 'บัวลอยป้าน้อย', 'bualoy-pa-noi',
 'ขนมไทยหน้าตลาด ขายบัวลอยไข่หวาน กล้วยบวชชี และรวมมิตรน้ำกะทิสด ทำใหม่ทุกวันไม่ใส่สารกันบูด',
 'cat-dessert', 25, 40, 4.7, '10:00:00', '18:00:00', 'tue,wed,thu,fri,sat,sun',
 '081-555-6677', 'ตลาดศรีย่าน ถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300',
 13.7795000, 100.5138000, 'open', 0),

('res-sdu-canteen', 'โรงอาหารกลาง สวนดุสิต', 'sdu-central-canteen',
 'โรงอาหารในมหาวิทยาลัย รวมร้านค้ากว่า 15 ร้านไว้ในที่เดียว ราคาเริ่มต้น 30 บาท มีที่นั่งกว้าง แอร์เย็น',
 'cat-budget', 30, 45, 4.2, '07:00:00', '17:00:00', 'mon,tue,wed,thu,fri',
 '02-244-5555', 'มหาวิทยาลัยสวนดุสิต 295 ถนนนครราชสีมา เขตดุสิต กรุงเทพมหานคร 10300',
 13.7772000, 100.5186000, 'open', 1);

INSERT INTO `menus` (`id`, `restaurant_id`, `name`, `price`, `description`, `recommended`) VALUES
('menu-01', 'res-khrua-yai',     'กะเพราหมูสับไข่ดาว',               55, 'ไฟแรงกลิ่นหอมกระทะ เผ็ดได้ตามสั่ง',      1),
('menu-02', 'res-khrua-yai',     'ข้าวผัดกุ้ง',                       65, 'กุ้งสด 5 ตัว เสิร์ฟพร้อมมะนาว',           1),
('menu-03', 'res-khrua-yai',     'ผัดซีอิ๊วหมู',                      50, 'เส้นใหญ่ผัดไฟแรง ไข่นุ่ม',                0),
('menu-04', 'res-ruea-nung',     'ก๋วยเตี๋ยวเรือหมูน้ำตก (ชามเล็ก)',   20, 'น้ำซุปเข้มข้น เลือกเส้นได้',              1),
('menu-05', 'res-ruea-nung',     'ก๋วยเตี๋ยวเนื้อตุ๋น (ชามพิเศษ)',     60, 'เนื้อตุ๋นเปื่อยนุ่ม เครื่องเต็มชาม',      1),
('menu-06', 'res-dusit-brew',    'Dirty Latte',                      85, 'เอสเปรสโซเข้ม ๆ ราดบนนมเย็น',            1),
('menu-07', 'res-dusit-brew',    'อเมริกาโน่เย็น',                    65, 'เมล็ดคั่วกลางจากเชียงราย',                1),
('menu-08', 'res-bualoy-pa-noi', 'บัวลอยไข่หวาน',                    35, 'กะทิสดคั้นเอง ไข่หวานเยิ้ม',             1),
('menu-09', 'res-bualoy-pa-noi', 'รวมมิตรน้ำกะทิ',                   40, 'ลอดช่อง เผือก ขนุน ครบเครื่อง',          1),
('menu-10', 'res-sdu-canteen',   'ข้าวราดแกง 2 อย่าง',                40, 'เลือกกับข้าวได้กว่า 10 อย่างทุกวัน',      1),
('menu-11', 'res-sdu-canteen',   'ข้าวมันไก่',                        40, 'น้ำจิ้มเต้าเจี้ยวสูตรเฉพาะ',              1);

INSERT INTO `reviews` (`id`, `restaurant_id`, `author`, `rating`, `comment`) VALUES
('rev-01', 'res-khrua-yai',     'ปอนด์ (นักศึกษาปี 3)', 5, 'กะเพราที่นี่หอมกระทะจริง ราคาไม่แพง อิ่มทุกครั้ง'),
('rev-02', 'res-khrua-yai',     'มายด์',                4, 'อร่อยดี แต่ช่วงเที่ยงต้องรอประมาณ 15 นาที'),
('rev-03', 'res-ruea-nung',     'เจได',                 5, 'สั่งทีละ 3 ชามยังไม่ถึงร้อย น้ำซุปเข้มข้นมาก'),
('rev-04', 'res-dusit-brew',    'ฟ้า',                  4, 'นั่งติวได้ทั้งบ่าย ปลั๊กครบทุกโต๊ะ Wi-Fi ไม่หลุด'),
('rev-05', 'res-bualoy-pa-noi', 'ใบเตย',                5, 'กะทิหอมมาก หวานกำลังดี ไม่เลี่ยน'),
('rev-06', 'res-sdu-canteen',   'ภูมิ',                 4, 'ราคาถูกที่สุดแถวนี้ แต่พักเที่ยงต้องแย่งที่นั่ง');

-- =============================================================================
--  ตัวอย่าง query ที่หน้าเว็บใช้จริง (ถ้าย้ายไป backend ให้เขียนเป็น PDO
--  prepared statement เสมอ — อย่าต่อสตริงค่าตัวแปรเข้าไปใน SQL)
-- =============================================================================

-- ร้านแนะนำหน้าแรก พร้อมชื่อหมวดหมู่และคะแนนเฉลี่ยจากรีวิวจริง
--   SELECT r.*, c.name AS category_name,
--          COALESCE(AVG(v.rating), r.rating) AS rating_avg,
--          COUNT(v.id) AS review_count
--   FROM restaurants r
--   LEFT JOIN categories c ON c.id = r.category_id
--   LEFT JOIN reviews    v ON v.restaurant_id = r.id
--   WHERE r.featured = 1
--   GROUP BY r.id
--   ORDER BY rating_avg DESC
--   LIMIT 6;

-- ค้นหาร้าน (ชื่อร้าน คำอธิบาย ที่อยู่ หรือชื่อเมนู)
--   SELECT DISTINCT r.*
--   FROM restaurants r
--   LEFT JOIN menus m ON m.restaurant_id = r.id
--   WHERE r.name LIKE CONCAT('%', ?, '%')
--      OR r.description LIKE CONCAT('%', ?, '%')
--      OR r.address LIKE CONCAT('%', ?, '%')
--      OR m.name LIKE CONCAT('%', ?, '%');

-- ร้านที่เปิดอยู่ตอนนี้ (รวมกรณีปิดหลังเที่ยงคืน)
--   SELECT * FROM restaurants
--   WHERE status = 'open'
--     AND FIND_IN_SET(LOWER(DATE_FORMAT(NOW(), '%a')), open_days)
--     AND (
--          (close_time > open_time AND CURTIME() BETWEEN open_time AND close_time)
--       OR (close_time < open_time AND (CURTIME() >= open_time OR CURTIME() < close_time))
--     );

-- สถิติหน้า Dashboard
--   SELECT
--     (SELECT COUNT(*) FROM restaurants) AS total_restaurants,
--     (SELECT COUNT(*) FROM categories)  AS total_categories,
--     (SELECT COUNT(*) FROM menus)       AS total_menus,
--     (SELECT COUNT(*) FROM reviews)     AS total_reviews;

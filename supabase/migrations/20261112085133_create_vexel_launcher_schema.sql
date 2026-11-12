/*
# Vexel Launcher — core schema

Single-tenant launcher app (no sign-in). Data is intentionally shared/public for the
anon-key frontend, so policies use TO anon, authenticated USING (true).

1. New Tables
- `launcher_settings`: single-row key-value store for launcher preferences
  - `key` (text, primary key), `value` (jsonb), `updated_at` (timestamptz)
- `instances`: Minecraft installations/profiles
  - `id`, `name`, `mc_version`, `loader` (vanilla|fabric|forge|quilt),
    `accent` (color token), `last_played_at`, `playtime_minutes`, `created_at`
- `mods`: seeded mod catalog
  - `id`, `name`, `slug` (unique), `description`, `author`, `category`,
    `downloads`, `mc_versions` (text[]), `loader`
- `instance_mods`: join of which mods are installed in which instance
  - `instance_id` FK -> instances, `mod_id` FK -> mods, `installed_at`
- `activity_logs`: launcher event feed
  - `id`, `message`, `kind` (info|success|warning|error), `created_at`
- `news_posts`: seeded launcher/minecraft news
  - `id`, `title`, `tag`, `excerpt`, `body`, `published_at`

2. Security
- RLS enabled on every table.
- CRUD granted to anon + authenticated; policies allow full access because
  this launcher is a local single-user app with no auth screen.
*/

CREATE TABLE IF NOT EXISTS launcher_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT 'null'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE launcher_settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON launcher_settings TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_settings" ON launcher_settings;
CREATE POLICY "public_read_settings" ON launcher_settings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_settings" ON launcher_settings;
CREATE POLICY "public_insert_settings" ON launcher_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_settings" ON launcher_settings;
CREATE POLICY "public_update_settings" ON launcher_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_settings" ON launcher_settings;
CREATE POLICY "public_delete_settings" ON launcher_settings FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mc_version text NOT NULL,
  loader text NOT NULL DEFAULT 'vanilla',
  accent text NOT NULL DEFAULT 'emerald',
  last_played_at timestamptz,
  playtime_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE instances ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON instances TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_instances" ON instances;
CREATE POLICY "public_read_instances" ON instances FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_instances" ON instances;
CREATE POLICY "public_insert_instances" ON instances FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_instances" ON instances;
CREATE POLICY "public_update_instances" ON instances FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_instances" ON instances;
CREATE POLICY "public_delete_instances" ON instances FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS mods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'utility',
  downloads integer NOT NULL DEFAULT 0,
  mc_versions text[] NOT NULL DEFAULT '{}',
  loader text NOT NULL DEFAULT 'fabric'
);

ALTER TABLE mods ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON mods TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_mods" ON mods;
CREATE POLICY "public_read_mods" ON mods FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_mods" ON mods;
CREATE POLICY "public_insert_mods" ON mods FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_mods" ON mods;
CREATE POLICY "public_update_mods" ON mods FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_mods" ON mods;
CREATE POLICY "public_delete_mods" ON mods FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS instance_mods (
  instance_id uuid NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  mod_id uuid NOT NULL REFERENCES mods(id) ON DELETE CASCADE,
  installed_at timestamptz DEFAULT now(),
  PRIMARY KEY (instance_id, mod_id)
);

ALTER TABLE instance_mods ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON instance_mods TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_instance_mods" ON instance_mods;
CREATE POLICY "public_read_instance_mods" ON instance_mods FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_instance_mods" ON instance_mods;
CREATE POLICY "public_insert_instance_mods" ON instance_mods FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_instance_mods" ON instance_mods;
CREATE POLICY "public_update_instance_mods" ON instance_mods FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_instance_mods" ON instance_mods;
CREATE POLICY "public_delete_instance_mods" ON instance_mods FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  kind text NOT NULL DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_logs TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_logs" ON activity_logs;
CREATE POLICY "public_read_logs" ON activity_logs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_logs" ON activity_logs;
CREATE POLICY "public_insert_logs" ON activity_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_logs" ON activity_logs;
CREATE POLICY "public_update_logs" ON activity_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_logs" ON activity_logs;
CREATE POLICY "public_delete_logs" ON activity_logs FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  tag text NOT NULL DEFAULT 'News',
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  published_at timestamptz DEFAULT now()
);

ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON news_posts TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_news" ON news_posts;
CREATE POLICY "public_read_news" ON news_posts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_news" ON news_posts;
CREATE POLICY "public_insert_news" ON news_posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_news" ON news_posts;
CREATE POLICY "public_update_news" ON news_posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_news" ON news_posts;
CREATE POLICY "public_delete_news" ON news_posts FOR DELETE
  TO anon, authenticated USING (true);


-- Seed: mod catalog (idempotent — skip existing slugs)
INSERT INTO mods (name, slug, description, author, category, downloads, mc_versions, loader)
SELECT * FROM (VALUES
  ('Sodium', 'sodium', 'Tối ưu hóa render mạnh mẽ nhất — tăng FPS gấp nhiều lần.', 'jellysquid3', 'performance', 48210211, ARRAY['1.21.3','1.21.1','1.20.6','1.20.1'], 'fabric'),
  ('Lithium', 'lithium', 'Tối ưu logic game server-side mà không thay đổi gameplay.', 'jellysquid3', 'performance', 31208874, ARRAY['1.21.3','1.21.1','1.20.1'], 'fabric'),
  ('Iris Shaders', 'iris', 'Chạy shader OptiFine trên Fabric với hiệu năng cao.', 'coderbot', 'graphics', 38881234, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1'], 'fabric'),
  ('JEI — Just Enough Items', 'jei', 'Xem công thức chế tạo và tra cứu mọi vật phẩm trong game.', 'mezz', 'utility', 90211455, ARRAY['1.21.1','1.20.4','1.20.1','1.19.2'], 'forge'),
  ('Fabric API', 'fabric-api', 'Thư viện lõi bắt buộc cho hầu hết các mod Fabric.', 'FabricMC', 'library', 98812340, ARRAY['1.21.3','1.21.1','1.20.6','1.20.4','1.20.1'], 'fabric'),
  ('Create', 'create', 'Máy móc, băng chuyền và tự động hóa mang tính nghệ thuật.', 'simibubi', 'content', 41203987, ARRAY['1.20.1','1.19.2'], 'forge'),
  ('Waystones', 'waystones', 'Bia dịch chuyển giữa các địa điểm đã khám phá.', 'BlayTheNinth', 'content', 65512003, ARRAY['1.21.1','1.20.4','1.20.1'], 'forge'),
  ('AppleSkin', 'appleskin', 'Hiển thị độ đói, độ bão hòa và giá trị thức ăn chi tiết.', 'squeek502', 'utility', 78990412, ARRAY['1.21.3','1.21.1','1.20.1','1.19.2'], 'fabric'),
  ('ModMenu', 'modmenu', 'Menu quản lý và cấu hình tất cả mod ngay trong game.', 'Prospector', 'utility', 52311098, ARRAY['1.21.3','1.21.1','1.20.4'], 'fabric'),
  ('Terralith', 'terralith', 'Tạo thế giới mới với hàng trăm biome ngoạn mục.', 'Starmute', 'worldgen', 29441877, ARRAY['1.21.1','1.20.4','1.20.1','1.19.2'], 'fabric')
) AS seed(name, slug, description, author, category, downloads, mc_versions, loader)
WHERE NOT EXISTS (SELECT 1 FROM mods WHERE mods.slug = seed.slug);


-- Seed: default instance + settings + a welcome log (idempotent)
INSERT INTO instances (name, mc_version, loader, accent)
SELECT 'Vexel Survival', '1.21.3', 'fabric', 'emerald'
WHERE NOT EXISTS (SELECT 1 FROM instances);

INSERT INTO launcher_settings (key, value)
SELECT 'launcher', '{"username":"Steve","ramMb":4096,"resolutionWidth":1280,"resolutionHeight":720,"javaArgs":"","closeOnLaunch":false,"theme":"dark","downloadSource":"official"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM launcher_settings WHERE key = 'launcher');

INSERT INTO activity_logs (message, kind)
SELECT 'Vexel Launcher khởi động lần đầu — chào mừng!', 'success'
WHERE NOT EXISTS (SELECT 1 FROM activity_logs);


-- Seed: news (idempotent on title)
INSERT INTO news_posts (title, tag, excerpt, body, published_at)
SELECT * FROM (VALUES
  ('Vexel Launcher 1.0 ra mắt', 'Launcher', 'Trình khởi chạy thế hệ mới: nhanh hơn, đẹp hơn, viết bằng Rust core.', 'Phiên bản đầu tiên của Vexel Launcher chính thức phát hành với core Rust hiệu năng cao, quản lý instances, mod browser tích hợp và trình tải xuống song song.', now() - interval '1 day'),
  ('Minecraft 1.21.3 — bản vá tháng 11', 'Minecraft', 'Sửa lỗi bundle, cải thiện độ ổn định của server và cân bằng spawn.', 'Bản vá 1.21.3 tập trung vào sửa lỗi nghiêm trọng với bundle, cải thiện hiệu năng chunk loading và vá một số lỗi crash trên macOS.', now() - interval '4 days'),
  ('Tricky Trials: đại diện cộng đồng chia sẻ', 'Community', 'Những map trial chamber ấn tượng nhất tháng này từ cộng đồng Việt Nam.', 'Cộng đồng builder Việt Nam vừa tổ chức cuộc thi thiết kế trial chamber với hơn 200 bài dự thi. Cùng điểm qua top 5 tác phẩm xuất sắc nhất.', now() - interval '9 days')
) AS seed(title, tag, excerpt, body, published_at)
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE news_posts.title = seed.title);

/*
# Vexel Launcher — resource packs

1. New Tables
- `resource_packs`: seeded catalog of resource packs
  - `id`, `name`, `slug` (unique), `description`, `author`, `category`
    (realistic|faithful|pvp|cartoon|utility), `resolution` (16x, 32x, 64x...),
    `downloads`, `size_mb`, `mc_versions` (text[]), `accent`
- `instance_resource_packs`: which packs are installed in which instance
  - `instance_id` FK -> instances (cascade), `pack_id` FK -> resource_packs (cascade),
    `enabled` (on/off without uninstalling), `position` (load priority, lower = higher priority),
    `installed_at`
2. Security
- RLS enabled on both tables; CRUD grants + 4 policies each for anon, authenticated
  (single-tenant no-auth app — data intentionally shared).
3. Seed
- 10 well-known resource packs, idempotent on slug.
*/

CREATE TABLE IF NOT EXISTS resource_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'faithful',
  resolution text NOT NULL DEFAULT '16x',
  downloads integer NOT NULL DEFAULT 0,
  size_mb integer NOT NULL DEFAULT 0,
  mc_versions text[] NOT NULL DEFAULT '{}',
  accent text NOT NULL DEFAULT 'emerald'
);

ALTER TABLE resource_packs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON resource_packs TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_resource_packs" ON resource_packs;
CREATE POLICY "public_read_resource_packs" ON resource_packs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_resource_packs" ON resource_packs;
CREATE POLICY "public_insert_resource_packs" ON resource_packs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_resource_packs" ON resource_packs;
CREATE POLICY "public_update_resource_packs" ON resource_packs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_resource_packs" ON resource_packs;
CREATE POLICY "public_delete_resource_packs" ON resource_packs FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS instance_resource_packs (
  instance_id uuid NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  pack_id uuid NOT NULL REFERENCES resource_packs(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  installed_at timestamptz DEFAULT now(),
  PRIMARY KEY (instance_id, pack_id)
);

CREATE INDEX IF NOT EXISTS idx_instance_resource_packs_pack ON instance_resource_packs(pack_id);

ALTER TABLE instance_resource_packs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON instance_resource_packs TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_instance_resource_packs" ON instance_resource_packs;
CREATE POLICY "public_read_instance_resource_packs" ON instance_resource_packs FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_instance_resource_packs" ON instance_resource_packs;
CREATE POLICY "public_insert_instance_resource_packs" ON instance_resource_packs FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_instance_resource_packs" ON instance_resource_packs;
CREATE POLICY "public_update_instance_resource_packs" ON instance_resource_packs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_instance_resource_packs" ON instance_resource_packs;
CREATE POLICY "public_delete_instance_resource_packs" ON instance_resource_packs FOR DELETE
  TO anon, authenticated USING (true);

INSERT INTO resource_packs (name, slug, description, author, category, resolution, downloads, size_mb, mc_versions, accent)
SELECT * FROM (VALUES
  ('Faithful 32x', 'faithful-32x', 'Giữ nguyên phong cách gốc nhưng sắc nét gấp đôi.', 'Faithful Team', 'faithful', '32x', 38211450, 18, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1','1.19.2','1.16.5','1.12.2'], 'emerald'),
  ('Faithful 64x', 'faithful-64x', 'Phiên bản 64x chi tiết hơn của Faithful, vẫn trung thành với bản gốc.', 'Faithful Team', 'faithful', '64x', 12049871, 54, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1'], 'emerald'),
  ('Bare Bones', 'bare-bones', 'Phong cách tối giản giống trailer chính thức của Minecraft.', 'RobotPants', 'cartoon', '16x', 9812230, 6, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1','1.19.2'], 'sky'),
  ('Stay True', 'stay-true', 'Làm mới texture vanilla với nhiều biến thể tự nhiên.', 'haydenfss', 'faithful', '16x', 7320918, 14, ARRAY['1.21.1','1.20.4','1.20.1','1.19.2'], 'lime'),
  ('Patrix 128x', 'patrix', 'Texture chân thực, hỗ trợ bản đồ pháp tuyến cho shader.', 'Patrix', 'realistic', '128x', 5610342, 312, ARRAY['1.21.1','1.20.4','1.20.1'], 'amber'),
  ('Mizuno''s 16 Craft', 'mizuno-16', 'Phong cách anime tươi sáng, cực kỳ đồng bộ.', 'Mizuno', 'cartoon', '16x', 4420113, 22, ARRAY['1.21.1','1.20.1','1.19.2'], 'rose'),
  ('Fresh Animations', 'fresh-animations', 'Thêm hoạt ảnh sống động cho mob mà không cần mod.', 'FreshLX', 'utility', '16x', 16221340, 9, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1'], 'sky'),
  ('Low On Fire', 'low-on-fire', 'Hạ thấp ngọn lửa trên màn hình để dễ nhìn khi PvP.', 'Vexel Community', 'pvp', '16x', 3011280, 1, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1','1.8.9'], 'rose'),
  ('Clear Glass', 'clear-glass', 'Kính trong suốt, không viền — đẹp cho mọi công trình.', 'Vexel Community', 'utility', '16x', 6811023, 1, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1','1.19.2','1.16.5'], 'lime'),
  ('Default Dark Mode', 'default-dark-mode', 'Giao diện tối cho mọi menu và GUI trong game.', 'nebulr', 'utility', '16x', 11208774, 3, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1','1.19.2'], 'amber')
) AS seed(name, slug, description, author, category, resolution, downloads, size_mb, mc_versions, accent)
WHERE NOT EXISTS (SELECT 1 FROM resource_packs WHERE resource_packs.slug = seed.slug);

/*
# Shader packs + locally imported packs

1. Modified tables
- `resource_packs`
  - `kind` (text, default 'resource'): 'resource' for texture packs, 'shader' for shader packs
  - `is_local` (boolean, default false): true when the user imported the pack from their own .zip file
2. Seed
- 6 well-known shader packs (kind = 'shader'), idempotent on slug.
3. Security
- No policy changes; existing anon/authenticated policies on resource_packs still apply.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resource_packs' AND column_name = 'kind') THEN
    ALTER TABLE resource_packs ADD COLUMN kind text NOT NULL DEFAULT 'resource';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resource_packs' AND column_name = 'is_local') THEN
    ALTER TABLE resource_packs ADD COLUMN is_local boolean NOT NULL DEFAULT false;
  END IF;
END $$;

INSERT INTO resource_packs (name, slug, description, author, category, resolution, downloads, size_mb, mc_versions, accent, kind)
SELECT * FROM (VALUES
  ('Complementary Reimagined', 'complementary-reimagined', 'Shader đẹp mà nhẹ, giữ cảm giác vanilla, nước và mây tuyệt đẹp.', 'EminGT', 'balanced', 'Medium', 21330412, 2, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1','1.19.2','1.16.5'], 'emerald', 'shader'),
  ('BSL Shaders', 'bsl-shaders', 'Ánh sáng ấm, bóng đổ mềm, phản chiếu mặt nước chân thực.', 'capttatsu', 'balanced', 'High', 18210335, 1, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1','1.19.2','1.16.5','1.12.2'], 'amber', 'shader'),
  ('Sildur''s Vibrant', 'sildurs-vibrant', 'Màu sắc rực rỡ, nhiều mức cấu hình từ Lite đến Extreme.', 'Sildur', 'vibrant', 'Medium', 15442190, 1, ARRAY['1.21.1','1.20.4','1.20.1','1.19.2','1.16.5','1.12.2','1.8.9'], 'sky', 'shader'),
  ('MakeUp Ultra Fast', 'makeup-ultra-fast', 'Siêu nhẹ, chạy tốt trên máy yếu và laptop tích hợp.', 'XorDev', 'performance', 'Low', 6120893, 1, ARRAY['1.21.3','1.21.1','1.20.4','1.20.1','1.19.2'], 'lime', 'shader'),
  ('SEUS PTGI HRR', 'seus-ptgi', 'Dò tia (path tracing) chân thực — cần card đồ họa mạnh.', 'Sonic Ether', 'realistic', 'Ultra', 4012877, 3, ARRAY['1.21.1','1.20.1','1.19.2','1.16.5'], 'rose', 'shader'),
  ('Rethinking Voxels', 'rethinking-voxels', 'Ánh sáng màu từ đuốc, lava và đèn lan tỏa theo từng khối.', 'gri573', 'realistic', 'High', 2890114, 2, ARRAY['1.21.1','1.20.4','1.20.1'], 'amber', 'shader')
) AS seed(name, slug, description, author, category, resolution, downloads, size_mb, mc_versions, accent, kind)
WHERE NOT EXISTS (SELECT 1 FROM resource_packs WHERE resource_packs.slug = seed.slug);

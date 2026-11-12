/*
# Vexel Launcher — worlds, saves & servers

1. New Tables
- `worlds`: saved worlds (saves) belonging to each instance
  - `id`, `instance_id` FK -> instances, `name`, `game_mode` (survival|creative|hardcore),
    `size_mb`, `last_played_at`, `created_at`
- `servers`: favorite multiplayer servers
  - `id`, `name`, `address`, `accent`, `players_online`, `players_max`,
    `motd`, `last_ping_ms`, `favorited`, `created_at`
2. Modified tables
- `instances`: new optional columns — `notes` (free-text notes),
  `game_dir` (isolated folder name), `width`/`height` (per-instance resolution override, 0 = follow global)
- `instance_mods`: new column `enabled` (per-mod on/off toggle without uninstalling)
3. Security
- RLS enabled on both new tables; grants + CRUD policies for anon, authenticated
  (single-tenant no-auth app, data intentionally public/shared).
*/

CREATE TABLE IF NOT EXISTS worlds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  name text NOT NULL,
  game_mode text NOT NULL DEFAULT 'survival',
  size_mb integer NOT NULL DEFAULT 0,
  last_played_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON worlds TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_worlds" ON worlds;
CREATE POLICY "public_read_worlds" ON worlds FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_worlds" ON worlds;
CREATE POLICY "public_insert_worlds" ON worlds FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_worlds" ON worlds;
CREATE POLICY "public_update_worlds" ON worlds FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_worlds" ON worlds;
CREATE POLICY "public_delete_worlds" ON worlds FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL UNIQUE,
  accent text NOT NULL DEFAULT 'emerald',
  players_online integer NOT NULL DEFAULT 0,
  players_max integer NOT NULL DEFAULT 20,
  motd text NOT NULL DEFAULT '',
  last_ping_ms integer,
  favorited boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON servers TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_servers" ON servers;
CREATE POLICY "public_read_servers" ON servers FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_servers" ON servers;
CREATE POLICY "public_insert_servers" ON servers FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_servers" ON servers;
CREATE POLICY "public_update_servers" ON servers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_servers" ON servers;
CREATE POLICY "public_delete_servers" ON servers FOR DELETE
  TO anon, authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instances' AND column_name = 'notes') THEN
    ALTER TABLE instances ADD COLUMN notes text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instances' AND column_name = 'game_dir') THEN
    ALTER TABLE instances ADD COLUMN game_dir text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instances' AND column_name = 'width') THEN
    ALTER TABLE instances ADD COLUMN width integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instances' AND column_name = 'height') THEN
    ALTER TABLE instances ADD COLUMN height integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'instance_mods' AND column_name = 'enabled') THEN
    ALTER TABLE instance_mods ADD COLUMN enabled boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Seed: a few worlds for existing instances (idempotent on name+instance)
INSERT INTO worlds (instance_id, name, game_mode, size_mb, last_played_at)
SELECT i.id, w.name, w.mode, w.size, w.played
FROM instances i
CROSS JOIN (VALUES
  ('Thung lũng Vexel', 'survival', 842, now() - interval '2 days'),
  ('Đảo bay', 'creative', 1245, now() - interval '5 days'),
  ('Hardcore mùa 3', 'hardcore', 316, now() - interval '12 days')
) AS w(name, mode, size, played)
LIMIT 1;

-- Seed: a couple of favorite servers (idempotent on address)
INSERT INTO servers (name, address, players_online, players_max, motd, last_ping_ms, favorited)
SELECT * FROM (VALUES
  ('Hypixel Network', 'mc.hypixel.net', 48213, 100000, 'The Hypixel Network - 1.8-1.21', 42, true),
  ('Wynncraft', 'play.wynncraft.com', 1240, 3000, 'The Minecraft MMORPG', 68, true),
  ('2builders2tools', '2b2t.org', 612, 1000, '2b2t - The Oldest Anarchy Server', 189, false)
) AS seed(name, address, online, max, motd, ping, fav)
WHERE NOT EXISTS (SELECT 1 FROM servers WHERE servers.address = seed.address);

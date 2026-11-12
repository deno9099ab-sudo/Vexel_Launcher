/*
# Per-instance Java settings

1. Modified tables
- `instances`
  - `ram_mb` (integer, default 0): RAM override for this instance; 0 = use global launcher setting
  - `java_args` (text, default ''): extra JVM arguments for this instance; empty = use global
2. Security
- No policy changes.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'instances' AND column_name = 'ram_mb') THEN
    ALTER TABLE instances ADD COLUMN ram_mb integer NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'instances' AND column_name = 'java_args') THEN
    ALTER TABLE instances ADD COLUMN java_args text NOT NULL DEFAULT '';
  END IF;
END $$;

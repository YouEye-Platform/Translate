import { query } from "./client";

let migrated = false;

export async function runMigrations(): Promise<void> {
  if (migrated) return;

  // ── translations table ────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS translations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      source_text TEXT NOT NULL,
      translated_text TEXT NOT NULL,
      source_lang TEXT NOT NULL,
      target_lang TEXT NOT NULL,
      char_count INT NOT NULL DEFAULT 0,
      detected_lang TEXT,
      backend TEXT NOT NULL DEFAULT 'mymemory',
      is_saved BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // ── language_preferences table ────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS language_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL UNIQUE,
      default_source_lang TEXT DEFAULT 'auto',
      default_target_lang TEXT DEFAULT 'en',
      recent_langs TEXT[] DEFAULT '{}',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // ── Indexes ───────────────────────────────────────────────
  await query(`CREATE INDEX IF NOT EXISTS idx_translations_user_id ON translations(user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at DESC)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_translations_saved ON translations(user_id, is_saved) WHERE is_saved = true`);
  await query(`CREATE INDEX IF NOT EXISTS idx_lang_prefs_user_id ON language_preferences(user_id)`);

  // ── Full-text search on translations ──────────────────────
  await query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='translations' AND column_name='search_vector') THEN
        ALTER TABLE translations ADD COLUMN search_vector TSVECTOR;
      END IF;
    END $$
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_translations_search ON translations USING GIN(search_vector)`);

  await query(`
    CREATE OR REPLACE FUNCTION translations_search_trigger() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector := to_tsvector('english', coalesce(NEW.source_text,'') || ' ' || coalesce(NEW.translated_text,''));
      RETURN NEW;
    END $$ LANGUAGE plpgsql
  `);

  await query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='translations_search_update') THEN
        CREATE TRIGGER translations_search_update BEFORE INSERT OR UPDATE ON translations
        FOR EACH ROW EXECUTE FUNCTION translations_search_trigger();
      END IF;
    END $$
  `);

  migrated = true;
}

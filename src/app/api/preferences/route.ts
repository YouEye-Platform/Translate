import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOne, query } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

export async function GET() {
  const session = await getSession("ye-translate");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await runMigrations();

  const prefs = await getOne(
    `SELECT default_source_lang, default_target_lang, recent_langs FROM language_preferences WHERE user_id = $1`,
    [session.userId]
  );

  return NextResponse.json({
    default_source_lang: prefs?.default_source_lang ?? "auto",
    default_target_lang: prefs?.default_target_lang ?? "es",
    recent_langs: prefs?.recent_langs ?? [],
  });
}

export async function PUT(request: NextRequest) {
  const session = await getSession("ye-translate");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await runMigrations();

  const body = await request.json();
  const { default_source_lang, default_target_lang } = body;

  await query(
    `INSERT INTO language_preferences (user_id, default_source_lang, default_target_lang, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       default_source_lang = COALESCE(EXCLUDED.default_source_lang, language_preferences.default_source_lang),
       default_target_lang = COALESCE(EXCLUDED.default_target_lang, language_preferences.default_target_lang),
       updated_at = NOW()`,
    [session.userId, default_source_lang ?? "auto", default_target_lang ?? "es"]
  );

  return NextResponse.json({ success: true });
}

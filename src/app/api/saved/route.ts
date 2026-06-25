import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMany } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

export async function GET() {
  const session = await getSession("ye-translate");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await runMigrations();

  const rows = await getMany(
    `SELECT id, source_text, translated_text, source_lang, target_lang, char_count, detected_lang, is_saved, created_at
     FROM translations WHERE user_id = $1 AND is_saved = true ORDER BY created_at DESC`,
    [session.userId]
  );

  return NextResponse.json({ translations: rows });
}

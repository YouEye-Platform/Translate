import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getMany } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { getLanguageName } from "@/lib/translate/languages";

export async function GET(request: Request) {
  const session = await getSession("ye-translate");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await runMigrations();
  const userId = session.userId;
  if (!userId) return NextResponse.json({ items: [] });

  const translations = await getMany(
    `SELECT id, source_text, translated_text, source_lang, target_lang, created_at
     FROM translations WHERE user_id = $1 AND is_saved = true
     ORDER BY created_at DESC LIMIT 6`,
    [userId]
  );

  const externalUrl = process.env.TRANSLATE_EXTERNAL_URL || "";

  return NextResponse.json({
    widget_type: "list",
    title: "Saved Phrases",
    items: translations.map((t) => ({
      id: t.id,
      source_text: String(t.source_text).slice(0, 60),
      translated_text: String(t.translated_text).slice(0, 60),
      source_lang: String(t.source_lang),
      target_lang: String(t.target_lang),
      source_lang_name: getLanguageName(String(t.source_lang)),
      target_lang_name: getLanguageName(String(t.target_lang)),
    })),
    empty_message: "No saved phrases yet. Star a translation to save it!",
    action: { label: "View all", url: `${externalUrl}/saved` },
  });
}

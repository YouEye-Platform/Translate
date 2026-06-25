import { NextResponse } from "next/server";
import { getMany } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { getLanguageName } from "@/lib/translate/languages";

export async function GET(request: Request) {
  await runMigrations();
  const userId = request.headers.get("x-youeye-user");
  if (!userId) return NextResponse.json({ items: [] });

  const translations = await getMany(
    `SELECT id, source_text, translated_text, source_lang, target_lang, created_at
     FROM translations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
    [userId]
  );

  const externalUrl = process.env.TRANSLATE_EXTERNAL_URL || "";

  return NextResponse.json({
    widget_type: "list",
    title: "Recent Translations",
    items: translations.map((t) => ({
      title: `${String(t.source_text).slice(0, 30)} → ${String(t.translated_text).slice(0, 30)}`,
      subtitle: `${getLanguageName(String(t.source_lang))} → ${getLanguageName(String(t.target_lang))}`,
      timestamp: t.created_at,
      action: { type: "link", url: externalUrl },
    })),
    empty_message: "No translations yet. Try translating something!",
    action: { label: "Open Translate", url: externalUrl },
  });
}

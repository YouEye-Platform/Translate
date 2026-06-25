import { NextRequest, NextResponse } from "next/server";
import { getOne } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { getLanguageName } from "@/lib/translate/languages";

export async function GET(request: NextRequest) {
  await runMigrations();
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";
  const userId = request.headers.get("x-youeye-user");

  if (!userId) {
    return NextResponse.json({ type: "translation-preview", title: "Translate", body: "Sign in to see your translations." });
  }

  const externalUrl = process.env.TRANSLATE_EXTERNAL_URL || "";

  if (query) {
    const match = await getOne(
      `SELECT source_text, translated_text, source_lang, target_lang FROM translations
       WHERE user_id = $1 AND search_vector @@ plainto_tsquery('english', $2)
       ORDER BY created_at DESC LIMIT 1`,
      [userId, query]
    );
    if (match) {
      return NextResponse.json({
        type: "translation-preview",
        title: `${getLanguageName(String(match.source_lang))} → ${getLanguageName(String(match.target_lang))}`,
        body: `"${String(match.source_text).slice(0, 80)}" → "${String(match.translated_text).slice(0, 80)}"`,
        action: { label: "Open Translate", url: externalUrl },
      });
    }
  }

  const recent = await getOne(
    `SELECT source_text, translated_text, source_lang, target_lang FROM translations
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  if (recent) {
    return NextResponse.json({
      type: "translation-preview",
      title: `${getLanguageName(String(recent.source_lang))} → ${getLanguageName(String(recent.target_lang))}`,
      body: `"${String(recent.source_text).slice(0, 80)}" → "${String(recent.translated_text).slice(0, 80)}"`,
      action: { label: "Open Translate", url: externalUrl },
    });
  }

  return NextResponse.json({
    type: "translation-preview",
    title: "Translate",
    body: "No translations yet. Start translating!",
    action: { label: "Open Translate", url: externalUrl },
  });
}

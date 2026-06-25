import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { translateLongText } from "@/lib/translate/mymemory";
import { query } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { emitTranslation } from "@/lib/timeline/emit";

export async function POST(request: NextRequest) {
  const session = await getSession("ye-translate");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { text, sourceLang, targetLang } = body;

  if (!text || !targetLang) {
    return NextResponse.json({ error: "text and targetLang required" }, { status: 400 });
  }
  if (text.length > 5000) {
    return NextResponse.json({ error: "Text too long (max 5000 chars)" }, { status: 400 });
  }

  await runMigrations();

  let result;
  try {
    result = await translateLongText(text, sourceLang ?? "auto", targetLang, session.userId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const finalSourceLang = sourceLang === "auto" && result.detectedLanguage
    ? result.detectedLanguage
    : sourceLang ?? "auto";

  const insertResult = await query<{ id: string }>(
    `INSERT INTO translations (user_id, source_text, translated_text, source_lang, target_lang, char_count, detected_lang, backend)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [session.userId, text, result.translatedText, finalSourceLang, targetLang, text.length, result.detectedLanguage ?? null, "mymemory"]
  );
  const translationId = insertResult.rows?.[0]?.id;

  await query(
    `INSERT INTO language_preferences (user_id, default_source_lang, default_target_lang, recent_langs, updated_at)
     VALUES ($1, $2, $3, ARRAY[$2, $3], NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       default_source_lang = EXCLUDED.default_source_lang,
       default_target_lang = EXCLUDED.default_target_lang,
       recent_langs = (
         SELECT ARRAY(SELECT DISTINCT unnest FROM unnest(
           ARRAY[$2, $3] || COALESCE(language_preferences.recent_langs, '{}')
         ) LIMIT 5)
       ),
       updated_at = NOW()`,
    [session.userId, finalSourceLang, targetLang]
  );

  emitTranslation(session.userId, finalSourceLang, targetLang, text.length, text).catch(() => {});

  return NextResponse.json({
    id: translationId,
    translatedText: result.translatedText,
    detectedLanguage: result.detectedLanguage,
    sourceLang: finalSourceLang,
    targetLang,
    charCount: text.length,
  });
}

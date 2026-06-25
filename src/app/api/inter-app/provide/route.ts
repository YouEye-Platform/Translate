import { NextResponse } from "next/server";
import { getMany } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { translateLongText } from "@/lib/translate/mymemory";

export async function POST(request: Request) {
  await runMigrations();
  const body = await request.json();
  const { request_type, data } = body;

  if (request_type === "translate" && data?.text) {
    try {
      const result = await translateLongText(
        data.text,
        data.source_lang ?? "auto",
        data.target_lang ?? "en"
      );
      return NextResponse.json({
        provider: "ye-translate",
        translatedText: result.translatedText,
        detectedLanguage: result.detectedLanguage,
      });
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 502 });
    }
  }

  if (request_type === "search" && data?.query) {
    const userId = data.user_id;
    if (!userId) return NextResponse.json({ results: [] });

    const results = await getMany(
      `SELECT id, source_text, translated_text, source_lang, target_lang, created_at
       FROM translations
       WHERE user_id = $1 AND search_vector @@ plainto_tsquery('english', $2)
       ORDER BY created_at DESC LIMIT 5`,
      [userId, data.query]
    );

    return NextResponse.json({
      provider: "ye-translate",
      results: results.map((r) => ({
        title: `${String(r.source_text).slice(0, 60)}`,
        preview: `→ ${String(r.translated_text).slice(0, 120)}`,
        url: `/`,
        created_at: r.created_at,
      })),
    });
  }

  return NextResponse.json({ error: "Unknown request type" }, { status: 400 });
}

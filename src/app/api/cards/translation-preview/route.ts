import {getLocale} from "next-intl/server";
import {getTranslations as getInterfaceTranslations} from "next-intl/server";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getOne } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { getLanguageName } from "@/lib/translate/languages";

export async function GET(request: NextRequest) {
  const translateInterface = await getInterfaceTranslations("interface");
  const locale = await getLocale();
  const languageName = (code: string) => { try { return new Intl.DisplayNames([locale], {type:"language"}).of(code) || getLanguageName(code); } catch { return getLanguageName(code); } };
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";
  const session = await getSession("ye-translate");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await runMigrations();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.json({ type: "translation-preview", title: "Translate", body: translateInterface("m5f95fe0a661d") });
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
        title: `${languageName(String(match.source_lang))} → ${languageName(String(match.target_lang))}`,
        body: `"${String(match.source_text).slice(0, 80)}" → "${String(match.translated_text).slice(0, 80)}"`,
        action: { label: translateInterface("md92a46e5235b"), url: externalUrl },
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
      title: `${languageName(String(recent.source_lang))} → ${languageName(String(recent.target_lang))}`,
      body: `"${String(recent.source_text).slice(0, 80)}" → "${String(recent.translated_text).slice(0, 80)}"`,
      action: { label: translateInterface("md92a46e5235b"), url: externalUrl },
    });
  }

  return NextResponse.json({
    type: "translation-preview",
    title: "Translate",
    body: translateInterface("m60f4809485ae"),
    action: { label: translateInterface("md92a46e5235b"), url: externalUrl },
  });
}

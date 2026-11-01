import {getLocale, getTranslations} from "next-intl/server";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getOne } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { getLanguageName } from "@/lib/translate/languages";

export async function GET(request: Request) {
  const locale = await getLocale();
  const t = await getTranslations("interface");
  const languageName = (code: string) => getLanguageName(code, locale, t("m89ebfb7a88ca"));
  const session = await getSession("ye-translate");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await runMigrations();
  const userId = session.userId;
  if (!userId) return NextResponse.json({ widget_type: "custom", title: t("quickTranslateTitle"), data: {} });

  const prefs = await getOne<{ default_source_lang: string; default_target_lang: string }>(
    `SELECT default_source_lang, default_target_lang FROM language_preferences WHERE user_id = $1`,
    [userId]
  );

  const externalUrl = process.env.TRANSLATE_EXTERNAL_URL || "";
  const sourceLang = prefs?.default_source_lang ?? "auto";
  const targetLang = prefs?.default_target_lang ?? "en";

  return NextResponse.json({
    widget_type: "custom",
    title: t("quickTranslateTitle"),
    data: {
      lastSourceLang: sourceLang,
      lastTargetLang: targetLang,
      recentPair: `${languageName(sourceLang)} → ${languageName(targetLang)}`,
    },
    action: { label: t("md92a46e5235b"), url: externalUrl },
  });
}

import {getLocale, getTranslations} from "next-intl/server";
import { NextResponse } from "next/server";
import { getPhraseOfTheDay } from "@/lib/translate/phrases";
import { getLanguageName } from "@/lib/translate/languages";

export async function GET() {
  const locale = await getLocale();
  const t = await getTranslations("interface");
  const languageName = (code: string) => getLanguageName(code, locale, t("m89ebfb7a88ca"));
  const phrase = getPhraseOfTheDay();

  return NextResponse.json({
    widget_type: "custom",
    title: t("m3ccd05315c4d"),
    data: {
      text: phrase.text,
      translation: phrase.translation,
      lang: phrase.lang,
      lang_name: languageName(phrase.lang),
      target_lang: phrase.targetLang,
      target_lang_name: languageName(phrase.targetLang),
      categories: phrase.categories,
    },
  });
}

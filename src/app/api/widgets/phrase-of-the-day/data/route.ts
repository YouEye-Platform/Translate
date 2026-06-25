import { NextResponse } from "next/server";
import { getPhraseOfTheDay } from "@/lib/translate/phrases";
import { getLanguageName } from "@/lib/translate/languages";

export async function GET() {
  const phrase = getPhraseOfTheDay();

  return NextResponse.json({
    widget_type: "custom",
    title: "Phrase of the Day",
    data: {
      text: phrase.text,
      translation: phrase.translation,
      lang: phrase.lang,
      lang_name: getLanguageName(phrase.lang),
      target_lang: phrase.targetLang,
      target_lang_name: getLanguageName(phrase.targetLang),
      categories: phrase.categories,
    },
  });
}

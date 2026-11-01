import { getLocale, getTranslations as getInterfaceTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth";
import { getOne, getMany } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { getLanguageName } from "@/lib/translate/languages";
import { getPhraseOfTheDay } from "@/lib/translate/phrases";
import { QuickTranslateWidget } from "@/components/embed/quick-translate-widget";
import { RecentTranslationsWidget } from "@/components/embed/recent-translations-widget";
import { SavedPhrasesWidget } from "@/components/embed/saved-phrases-widget";
import { PhraseOfDayWidget } from "@/components/embed/phrase-of-day-widget";
import { MyActivityWidget } from "@/components/embed/my-activity-widget";

interface WidgetPageProps {
  params: Promise<{ widgetId: string }>;
}


export default async function TranslateWidgetPage({ params }: WidgetPageProps) {
  const translateInterface = await getInterfaceTranslations("interface");

  const locale = await getLocale();
  const languageName = (code: string) => {
    if (code === "auto") return translateInterface("detectLanguage");
    try { return new Intl.DisplayNames([locale], {type: "language"}).of(code) || getLanguageName(code); }
    catch { return getLanguageName(code); }
  };
  const timeAgo = (dateStr: string) => {
    const seconds = (new Date(dateStr).getTime() - Date.now()) / 1000;
    if (!Number.isFinite(seconds)) return "";
    const unit = Math.abs(seconds) < 60 ? "second" : Math.abs(seconds) < 3600 ? "minute" : Math.abs(seconds) < 86400 ? "hour" : "day";
    const divisor = {second: 1, minute: 60, hour: 3600, day: 86400}[unit];
    return new Intl.RelativeTimeFormat(locale, {numeric: "auto"}).format(Math.round(seconds / divisor), unit);
  };
  const { widgetId } = await params;
  await runMigrations();

  const session = await getSession("ye-translate").catch(() => null);
  if (!session) {
    return <EmptyState message={translateInterface("mc68c9c19a284")} />;
  }

  const externalUrl = process.env.TRANSLATE_EXTERNAL_URL || "";

  // ── Quick Translate ──
  if (widgetId === "quick-translate") {
    const prefs = await getOne<{ default_source_lang: string; default_target_lang: string }>(
      `SELECT default_source_lang, default_target_lang FROM language_preferences WHERE user_id = $1`,
      [session.userId]
    );
    const sourceLang = prefs?.default_source_lang ?? "auto";
    const targetLang = prefs?.default_target_lang ?? "en";

    return (
      <QuickTranslateWidget
        defaultSourceLang={sourceLang}
        defaultTargetLang={targetLang}
        sourceLangName={languageName(sourceLang)}
        targetLangName={languageName(targetLang)}
      />
    );
  }

  // ── Recent Translations ──
  if (widgetId === "recent-translations") {
    const translations = await getMany(
      `SELECT source_text, translated_text, source_lang, target_lang, created_at
       FROM translations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [session.userId]
    );
    if (translations.length === 0) {
      return <EmptyState message={translateInterface("m7ba6977e62fb")} />;
    }

    const items = translations.map((t) => ({
      source_text: String(t.source_text).slice(0, 40),
      translated_text: String(t.translated_text).slice(0, 40),
      source_lang_name: languageName(String(t.source_lang)),
      target_lang_name: languageName(String(t.target_lang)),
      time_ago: timeAgo(String(t.created_at)),
    }));

    return <RecentTranslationsWidget items={items} viewAllUrl={`${externalUrl}/saved`} />;
  }

  // ── Saved Phrases ──
  if (widgetId === "saved-phrases") {
    const translations = await getMany(
      `SELECT id, source_text, translated_text, source_lang, target_lang
       FROM translations WHERE user_id = $1 AND is_saved = true
       ORDER BY created_at DESC LIMIT 6`,
      [session.userId]
    );

    const phrases = translations.map((t) => ({
      id: String(t.id),
      source_text: String(t.source_text).slice(0, 60),
      translated_text: String(t.translated_text).slice(0, 60),
      source_lang: String(t.source_lang),
      target_lang: String(t.target_lang),
      source_lang_name: languageName(String(t.source_lang)),
      target_lang_name: languageName(String(t.target_lang)),
    }));

    return <SavedPhrasesWidget phrases={phrases} viewAllUrl={`${externalUrl}/saved`} />;
  }

  // ── Phrase of the Day ──
  if (widgetId === "phrase-of-the-day") {
    const phrase = getPhraseOfTheDay();
    return (
      <PhraseOfDayWidget
        text={phrase.text}
        translation={phrase.translation}
        langName={languageName(phrase.lang)}
        targetLangName={languageName(phrase.targetLang)}
        categories={phrase.categories}
      />
    );
  }

  // ── My Activity ──
  if (widgetId === "my-activity") {
    const weekStats = await getOne<{ count: string; langs: string; chars: string }>(
      `SELECT
         COUNT(*)::text AS count,
         COUNT(DISTINCT target_lang)::text AS langs,
         COALESCE(SUM(char_count), 0)::text AS chars
       FROM translations
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [session.userId]
    );

    const dailyCounts = await getMany<{ day: string; count: string }>(
      `SELECT
         TO_CHAR(created_at::date, 'Dy') AS day,
         COUNT(*)::text AS count
       FROM translations
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
       GROUP BY created_at::date, TO_CHAR(created_at::date, 'Dy')
       ORDER BY created_at::date`,
      [session.userId]
    );

    return (
      <MyActivityWidget
        translationsThisWeek={parseInt(weekStats?.count ?? "0", 10)}
        languagesUsed={parseInt(weekStats?.langs ?? "0", 10)}
        charsTranslated={parseInt(weekStats?.chars ?? "0", 10)}
        dailyCounts={dailyCounts.map((d) => ({ day: d.day, count: parseInt(d.count, 10) }))}
      />
    );
  }

  return <EmptyState message={translateInterface("mec29e7f61294")} />;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

import { getLocale, getTranslations as getInterfaceTranslations } from "next-intl/server";
import { ArrowRight, Languages } from "lucide-react";
import { getLanguageName } from "@/lib/translate/languages";

interface TranslationCardPageProps {
  searchParams: Promise<{
    source?: string;
    target?: string;
    sourceLang?: string;
    targetLang?: string;
    text?: string;
    translated?: string;
  }>;
}

export default async function TranslationPreviewCardPage({ searchParams }: TranslationCardPageProps) {
  const locale = await getLocale();
  const translateInterface = await getInterfaceTranslations("interface");

  const params = await searchParams;
  const sourceLang = params.sourceLang || params.source || "auto";
  const targetLang = params.targetLang || params.target || "en";
  const sourceText = params.text || translateInterface("m775b599621fc");
  const translatedText = params.translated || "";

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-foreground">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Languages className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{translateInterface("m6fbd766b1a71")}</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{getLanguageName(sourceLang, locale, translateInterface("m89ebfb7a88ca"))}</span>
            <ArrowRight className="h-3 w-3" />
            <span>{getLanguageName(targetLang, locale, translateInterface("m89ebfb7a88ca"))}</span>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextBlock label={translateInterface("m88d759ea02ce")} value={sourceText} />
        <TextBlock label={translateInterface("mabbc13c13e35")} value={translatedText || translateInterface("m3199baf381bb")} muted={!translatedText} />
      </div>
    </div>
  );
}

function TextBlock({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <p className={`line-clamp-4 text-sm leading-relaxed ${muted ? "text-muted-foreground" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

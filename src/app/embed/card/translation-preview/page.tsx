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
  const params = await searchParams;
  const sourceLang = params.sourceLang || params.source || "auto";
  const targetLang = params.targetLang || params.target || "en";
  const sourceText = params.text || "Translation preview";
  const translatedText = params.translated || "";

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-foreground">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Languages className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Translation</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{getLanguageName(sourceLang)}</span>
            <ArrowRight className="h-3 w-3" />
            <span>{getLanguageName(targetLang)}</span>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextBlock label="Original" value={sourceText} />
        <TextBlock label="Translated" value={translatedText || "Open Translate to create this translation."} muted={!translatedText} />
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

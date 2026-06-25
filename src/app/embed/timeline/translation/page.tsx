/**
 * Translate Timeline Embed — Translation Card
 *
 * Compact card rendered as iframe inside YE-UI timeline entries.
 * All data comes from URL params (stateless).
 *
 * Query params:
 *   ?src=en          — Source language code
 *   &tgt=ru          — Target language code
 *   &chars=142       — Character count
 *   &preview=Hello   — Text preview (URL-encoded)
 */

import { Languages, ArrowRight } from "lucide-react";

// Inline language name lookup (avoid importing full languages module in embed)
const LANG_NAMES: Record<string, string> = {
  auto: "Auto", en: "English", es: "Spanish", fr: "French", de: "German",
  ru: "Russian", zh: "Chinese", ja: "Japanese", ko: "Korean", pt: "Portuguese",
  it: "Italian", nl: "Dutch", pl: "Polish", ar: "Arabic", hi: "Hindi",
  tr: "Turkish", sv: "Swedish", uk: "Ukrainian", cs: "Czech", da: "Danish",
  fi: "Finnish", el: "Greek",
};

interface PageProps {
  searchParams: Promise<{ src?: string; tgt?: string; chars?: string; preview?: string }>;
}

export default async function TimelineTranslationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { src = "auto", tgt = "en", chars = "0", preview = "" } = params;

  const srcName = LANG_NAMES[src] || src;
  const tgtName = LANG_NAMES[tgt] || tgt;
  const charCount = parseInt(chars, 10) || 0;
  const decodedPreview = decodeURIComponent(preview);

  return (
    <div className="p-2.5">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded bg-violet-500/10 flex items-center justify-center shrink-0">
          <Languages className="h-5 w-5 text-violet-500" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Languages className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-[11px] font-medium text-violet-500">Translation</span>
            <span className="text-[10px] text-muted-foreground">
              {charCount} chars
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <span>{srcName}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span>{tgtName}</span>
          </div>

          {decodedPreview && (
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed italic">
              &ldquo;{decodedPreview}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

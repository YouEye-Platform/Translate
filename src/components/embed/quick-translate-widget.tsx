"use client";

import { useState, useCallback } from "react";
import { ArrowRight, Loader2, ArrowLeftRight } from "lucide-react";

interface QuickTranslateWidgetProps {
  defaultSourceLang: string;
  defaultTargetLang: string;
  sourceLangName: string;
  targetLangName: string;
}

export function QuickTranslateWidget({
  defaultSourceLang,
  defaultTargetLang,
  sourceLangName,
  targetLangName,
}: QuickTranslateWidgetProps) {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const translate = useCallback(async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          sourceLang: defaultSourceLang,
          targetLang: defaultTargetLang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.translatedText ?? "");
      } else {
        setResult("Translation failed.");
      }
    } catch {
      setResult("Translation failed.");
    } finally {
      setLoading(false);
    }
  }, [text, loading, defaultSourceLang, defaultTargetLang]);

  return (
    <div className="h-full p-3 flex flex-col gap-2">
      {/* Language pair header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium">{sourceLangName}</span>
        </div>
        <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          <span className="text-xs font-medium">{targetLangName}</span>
        </div>
      </div>

      {/* Input/Output */}
      <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              translate();
            }
          }}
          placeholder="Type to translate…"
          className="w-full h-full resize-none rounded-lg border border-border/40 bg-background px-2.5 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-violet-400/40"
        />
        <div className="w-full h-full overflow-auto rounded-lg bg-muted/30 border border-border/20 px-2.5 py-2 text-sm">
          {loading ? (
            <span className="text-muted-foreground animate-pulse">Translating…</span>
          ) : result ? (
            <span>{result}</span>
          ) : (
            <span className="text-muted-foreground/40">Translation here…</span>
          )}
        </div>
      </div>

      {/* Translate button */}
      <button
        onClick={translate}
        disabled={!text.trim() || loading}
        className="w-full flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 hover:from-violet-600 hover:to-purple-700 transition-all shadow-sm"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <>
            Translate
            <ArrowRight className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  );
}

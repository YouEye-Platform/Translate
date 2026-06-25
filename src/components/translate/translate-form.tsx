"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageSelector } from "./language-selector";
import { SwapButton } from "./swap-button";
import { TranslationResult } from "./translation-result";
import { getSourceLanguages, getTargetLanguages, getLanguageName } from "@/lib/translate/languages";

export function TranslateForm() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [lastId, setLastId] = useState<string | undefined>();
  const [isSaved, setIsSaved] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | undefined>();

  const sourceLanguages = getSourceLanguages();
  const targetLanguages = getTargetLanguages();

  // Load language preferences on mount
  useEffect(() => {
    fetch("/api/preferences")
      .then((res) => res.ok ? res.json() : null)
      .then((prefs) => {
        if (prefs) {
          setSourceLang(prefs.default_source_lang ?? "auto");
          setTargetLang(prefs.default_target_lang ?? "es");
        }
      })
      .catch(() => {});
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim() || !targetLang) return;
    setLoading(true);
    setTranslatedText("");
    setLastId(undefined);
    setIsSaved(false);
    setDetectedLang(undefined);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, sourceLang, targetLang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Translation failed");
      setTranslatedText(data.translatedText ?? "");
      if (data.detectedLanguage) setDetectedLang(data.detectedLanguage);
      if (data.id) {
        setLastId(data.id);
        setIsSaved(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setTranslatedText(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  // Keyboard shortcut: Ctrl+Enter to translate
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleTranslate();
      }
      // Ctrl+Shift+S to swap
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        handleSwap();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleTranslate]);

  const handleSwap = () => {
    if (sourceLang === "auto") return;
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleToggleSave = async () => {
    if (!lastId) return;
    try {
      const res = await fetch(`/api/saved/${lastId}`, { method: "PUT" });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.is_saved);
      }
    } catch {
      // Non-critical
    }
  };

  const charCount = sourceText.length;
  const charMax = 5000;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5">
        {/* Language selectors row */}
        <div className="flex items-center gap-3 justify-center">
          <div className="flex-1 max-w-xs">
            <LanguageSelector
              value={sourceLang}
              onChange={(v) => { setSourceLang(v); setDetectedLang(undefined); }}
              languages={sourceLanguages}
              placeholder="Detect language"
              variant="source"
            />
            {sourceLang === "auto" && detectedLang && (
              <p className="text-xs text-muted-foreground mt-1 ml-1">
                Detected: <span className="font-medium text-foreground">{getLanguageName(detectedLang)}</span>
              </p>
            )}
          </div>

          <SwapButton onClick={handleSwap} disabled={sourceLang === "auto"} />

          <div className="flex-1 max-w-xs">
            <LanguageSelector
              value={targetLang}
              onChange={setTargetLang}
              languages={targetLanguages}
              placeholder="Target language"
              variant="target"
            />
          </div>
        </div>

        {/* Two-pane translate area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source pane — card style */}
          <div className="flex flex-col rounded-2xl border border-border/60 bg-background shadow-sm min-h-[220px]">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Type or paste text here…"
              className="flex-1 p-4 text-base bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/50 min-h-[180px]"
              maxLength={charMax}
              aria-label="Source text"
            />
            <div className="flex items-center justify-between px-4 py-2 border-t border-border/30">
              <span className={`text-xs ${charCount > charMax * 0.9 ? "text-orange-500 font-medium" : "text-muted-foreground/60"}`}>
                {charCount.toLocaleString()} / {charMax.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Result pane */}
          <TranslationResult
            translatedText={translatedText}
            translationId={lastId}
            isSaved={isSaved}
            onToggleSave={handleToggleSave}
            loading={loading}
          />
        </div>

        {/* Translate button — centered, gradient */}
        <div className="flex justify-center">
          <Button
            onClick={handleTranslate}
            disabled={loading || !sourceText.trim()}
            className="rounded-full px-8 h-11 text-sm font-semibold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-violet-600 hover:to-purple-700 border-0 transition-all disabled:opacity-50"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Translating…
              </>
            ) : (
              <>
                Translate
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

      </div>
    </TooltipProvider>
  );
}

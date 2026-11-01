"use client";

import { useLocale, useTranslations as useInterfaceTranslations } from "next-intl";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowRight, X, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageSelector } from "./language-selector";
import { SwapButton } from "./swap-button";
import { TranslationResult } from "./translation-result";
import { getSourceLanguages, getTargetLanguages, getLanguageName } from "@/lib/translate/languages";

export function TranslateForm() {
  const translateInterface = useInterfaceTranslations("interface");
  const interfaceLocale = useLocale();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("es");
  const [loading, setLoading] = useState(false);
  const [translationFailed, setTranslationFailed] = useState(false);
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
    if (loading || !sourceText.trim() || !targetLang) return;
    setLoading(true);
    setTranslationFailed(false);
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
      if (!res.ok) throw new Error("Translation request failed");
      setTranslatedText(data.translatedText ?? "");
      if (data.detectedLanguage) setDetectedLang(data.detectedLanguage);
      if (data.id) {
        setLastId(data.id);
        setIsSaved(false);
      }
    } catch {
      setTranslationFailed(true);
    } finally {
      setLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, loading]);

  const handleSwap = useCallback(() => {
    if (loading || sourceLang === "auto") return;
    setTranslationFailed(false);
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  }, [loading, sourceLang, targetLang, translatedText, sourceText]);

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
  }, [handleTranslate, handleSwap]);

  const handleToggleSave = async () => {
    if (!lastId) return;
    try {
      const res = await fetch(`/api/saved/${lastId}`, { method: "PUT" });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.is_saved);
      }
    } catch {
      // Saving is optional; the translated text remains available.
    }
  };

  const charCount = sourceText.length;
  const charMax = 5000;

  return (
    <TooltipProvider>
      <div className="translation-workspace">
        <h1 className="sr-only">{translateInterface("uxTranslateText")}</h1>
        <div className="translation-language-bar">
          <div className="min-w-0">
            <LanguageSelector value={sourceLang} onChange={(v) => { setSourceLang(v); setDetectedLang(undefined); }} languages={sourceLanguages} placeholder={translateInterface("detectLanguage")} variant="source" disabled={loading} />
          </div>
          <SwapButton onClick={handleSwap} disabled={loading || sourceLang === "auto"} />
          <div className="min-w-0">
            <LanguageSelector value={targetLang} onChange={setTargetLang} languages={targetLanguages} placeholder={translateInterface("mea252b75a5db")} variant="target" disabled={loading} />
          </div>
        </div>

        <div className="translation-panels">
          <section className="translation-source" aria-label={translateInterface("uxSource")}>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={translateInterface("uxEnterText")}
              className="translation-input"
              maxLength={charMax}
              aria-label={translateInterface("ma155f1ea2dfd")}
              disabled={loading}
              dir="auto"
            />
            <footer>
              <Button variant="ghost" size="sm" disabled={loading || !sourceText} onClick={() => { setSourceText(""); setTranslatedText(""); setTranslationFailed(false); setLastId(undefined); setDetectedLang(undefined); setIsSaved(false); }}>
                <X className="h-4 w-4" /> {translateInterface("uxClear")}
              </Button>
              <Button onClick={handleTranslate} disabled={loading || !sourceText.trim()} className="translation-submit">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {translateInterface("me72799b80982")}</> : <>{translateInterface("m8fe147696fbf")} <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </footer>
          </section>
          <TranslationResult translatedText={translatedText} translationId={lastId} isSaved={isSaved} onToggleSave={handleToggleSave} loading={loading} error={translationFailed ? translateInterface("mb9725da1e57f") : undefined} language={getLanguageName(targetLang, interfaceLocale)} />
        </div>

        <div className="translation-note">
          <span>{sourceLang === "auto" && detectedLang ? translateInterface("uxDetectedLanguage", { language: getLanguageName(detectedLang, interfaceLocale) }) : translateInterface("uxTranslateShortcut")}</span>
          <span className={charCount > charMax * 0.9 ? "text-foreground font-medium" : ""}>{charCount.toLocaleString(interfaceLocale)} / {charMax.toLocaleString(interfaceLocale)}</span>
        </div>
        <section className="translation-collection">
          <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <h2>{translateInterface("uxCollectionTitle")}</h2>
          <p>{translateInterface("uxCollectionDescription")}</p>
          <Link href="/saved" className="inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4" prefetch={false}>{translateInterface("uxOpenSaved")} <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    </TooltipProvider>
  );
}

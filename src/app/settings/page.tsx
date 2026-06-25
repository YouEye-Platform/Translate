"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/translate/language-selector";
import { getSourceLanguages, getTargetLanguages } from "@/lib/translate/languages";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="text-muted-foreground animate-pulse">Loading...</div></div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  return <TranslateSettingsPanel />;
}

export function TranslateSettingsPanel({ embedded = false }: { embedded?: boolean }) {
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) return;
        const data = await res.json();
        setSourceLang(data.default_source_lang ?? "auto");
        setTargetLang(data.default_target_lang ?? "en");
      } catch {
        // Non-critical
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ default_source_lang: sourceLang, default_target_lang: targetLang }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className={embedded ? "p-4" : "container mx-auto max-w-2xl px-4 py-8"}>
        {!embedded && (
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Settings</h1>
            <a href="/" className="text-sm text-primary hover:underline">← Translate</a>
          </div>
        )}

        <div className="rounded-xl border p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-semibold mb-1">Language Preferences</h2>
            <p className="text-xs text-muted-foreground mb-4">
              These defaults will be pre-selected when you open the translate page.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Default Source</label>
                <LanguageSelector
                  value={sourceLang}
                  onChange={setSourceLang}
                  languages={getSourceLanguages()}
                  placeholder="Source language"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Default Target</label>
                <LanguageSelector
                  value={targetLang}
                  onChange={setTargetLang}
                  languages={getTargetLanguages()}
                  placeholder="Target language"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-auto self-start">
            {saved ? "Saved!" : loading ? "Saving…" : "Save Preferences"}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

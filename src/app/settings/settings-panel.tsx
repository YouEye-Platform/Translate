"use client";

import { useTranslations as useInterfaceTranslations } from "next-intl";
import Link from "next/link";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/translate/language-selector";
import { getSourceLanguages, getTargetLanguages } from "@/lib/translate/languages";
import { TooltipProvider } from "@/components/ui/tooltip";

export function TranslateSettingsPanel({ embedded = false }: { embedded?: boolean }) {
  const translateInterface = useInterfaceTranslations("interface");

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
            <h1 className="text-2xl font-bold">{translateInterface("m74a883a037bc")}</h1>
            <Link href="/" className="text-sm text-primary hover:underline" prefetch={false}>{translateInterface("mc8977b979163")}</Link>
          </div>
        )}

        <div className="rounded-xl border p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-semibold mb-1">{translateInterface("m7d6be8b918e8")}</h2>
            <p className="text-xs text-muted-foreground mb-4">
              {translateInterface("m80530c94dac7")}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{translateInterface("mf990849a5400")}</label>
                <LanguageSelector
                  value={sourceLang}
                  onChange={setSourceLang}
                  languages={getSourceLanguages()}
                  placeholder={translateInterface("m088b23e3327d")}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{translateInterface("m4f92c42a4148")}</label>
                <LanguageSelector
                  value={targetLang}
                  onChange={setTargetLang}
                  languages={getTargetLanguages()}
                  placeholder={translateInterface("mea252b75a5db")}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-auto self-start">
            {saved ? translateInterface("med9b760289e6") : loading ? translateInterface("m23e39291d613") : translateInterface("me5b8e6907faa")}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

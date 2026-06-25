"use client";

import { useState, useEffect } from "react";
import { SavedList } from "@/components/translate/saved-list";

interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  is_saved: boolean;
  created_at: string;
}

export default function SavedPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/saved");
        if (!res.ok) return;
        const data = await res.json();
        setTranslations(data.translations ?? []);
      } catch {
        // Non-critical
      }
    };
    load();
  }, []);

  const handleUnsave = async (id: string) => {
    await fetch(`/api/saved/${id}`, { method: "PUT" });
    setTranslations((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Saved Translations</h1>
          <p className="text-muted-foreground text-sm mt-1">{translations.length} saved</p>
        </div>
        <a href="/" className="text-sm text-primary hover:underline">← Translate</a>
      </div>
      <SavedList translations={translations} onUnsave={handleUnsave} />
    </div>
  );
}

"use client";

import { Languages } from "lucide-react";

interface PhraseOfDayWidgetProps {
  text: string;
  translation: string;
  langName: string;
  targetLangName: string;
  categories: string[];
}

export function PhraseOfDayWidget({ text, translation, langName, targetLangName, categories }: PhraseOfDayWidgetProps) {
  return (
    <div className="h-full p-3 flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <Languages className="h-3.5 w-3.5 text-violet-500" />
        <span className="text-xs font-semibold text-foreground">Phrase of the Day</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
        <p className="text-xl font-bold leading-snug">{text}</p>
        <p className="text-sm text-muted-foreground mt-2">{translation}</p>
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5">{langName}</span>
          <span>→</span>
          <span className="rounded-full bg-muted px-2 py-0.5">{targetLangName}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center mt-3">
        {categories.map((cat) => (
          <span
            key={cat}
            className="text-[10px] rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 px-2 py-0.5"
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}

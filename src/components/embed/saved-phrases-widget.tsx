"use client";

import { Star } from "lucide-react";

interface SavedPhrase {
  id: string;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  source_lang_name: string;
  target_lang_name: string;
}

interface SavedPhrasesWidgetProps {
  phrases: SavedPhrase[];
  viewAllUrl: string;
}

export function SavedPhrasesWidget({ phrases, viewAllUrl }: SavedPhrasesWidgetProps) {
  if (phrases.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No saved phrases yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-3 flex flex-col gap-2 overflow-auto">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold text-foreground">Saved Phrases</span>
        </div>
        {viewAllUrl && (
          <a href={viewAllUrl} target="_top" className="text-[10px] text-primary hover:underline">
            View all
          </a>
        )}
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-auto">
        {phrases.map((phrase) => (
          <div
            key={phrase.id}
            className="rounded-lg border border-border/30 bg-card/50 p-2.5 hover:bg-accent/20 transition-colors"
          >
            <p className="text-sm font-medium truncate">{phrase.source_text}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{phrase.translated_text}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] rounded-full bg-muted px-1.5 py-0.5">
                {phrase.source_lang_name}
              </span>
              <span className="text-[10px] text-muted-foreground">→</span>
              <span className="text-[10px] rounded-full bg-muted px-1.5 py-0.5">
                {phrase.target_lang_name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

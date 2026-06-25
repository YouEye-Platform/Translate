"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Translation {
  id: string;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  is_saved: boolean;
  created_at: string;
}

interface SavedListProps {
  translations: Translation[];
  onUnsave: (id: string) => void;
}

export function SavedList({ translations, onUnsave }: SavedListProps) {
  if (translations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p className="text-lg">No saved translations</p>
        <p className="text-sm mt-1">Star translations to save them here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {translations.map((t) => (
        <div
          key={t.id}
          className="flex items-start justify-between rounded-lg border p-4 hover:bg-accent/30 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">{t.source_lang}</Badge>
              <span className="text-muted-foreground text-xs">→</span>
              <Badge variant="outline" className="text-xs">{t.target_lang}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(t.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm font-medium">{t.source_text.slice(0, 200)}</p>
            <p className="text-sm text-muted-foreground mt-1">{t.translated_text.slice(0, 200)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-3 shrink-0"
            onClick={() => onUnsave(t.id)}
            aria-label="Unsave"
          >
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </Button>
        </div>
      ))}
    </div>
  );
}

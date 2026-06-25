"use client";

import { Clock } from "lucide-react";

interface RecentItem {
  source_text: string;
  translated_text: string;
  source_lang_name: string;
  target_lang_name: string;
  time_ago: string;
}

interface RecentTranslationsWidgetProps {
  items: RecentItem[];
  viewAllUrl: string;
}

export function RecentTranslationsWidget({ items, viewAllUrl }: RecentTranslationsWidgetProps) {
  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">No translations yet. Try translating something!</p>
      </div>
    );
  }

  return (
    <div className="h-full p-3 flex flex-col gap-2 overflow-auto">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-violet-500" />
          <span className="text-xs font-semibold text-foreground">Recent Translations</span>
        </div>
        {viewAllUrl && (
          <a href={viewAllUrl} target="_top" className="text-[10px] text-primary hover:underline">
            View all
          </a>
        )}
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-auto">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-border/30 bg-card/50 px-3 py-2 hover:bg-accent/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] rounded-full bg-muted px-1.5 py-0.5">
                  {item.source_lang_name}
                </span>
                <span className="text-[10px] text-muted-foreground">→</span>
                <span className="text-[10px] rounded-full bg-muted px-1.5 py-0.5">
                  {item.target_lang_name}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/60">{item.time_ago}</span>
            </div>
            <p className="text-xs truncate">
              <span className="font-medium">&ldquo;{item.source_text}&rdquo;</span>
              <span className="text-muted-foreground mx-1">→</span>
              <span className="text-muted-foreground">&ldquo;{item.translated_text}&rdquo;</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

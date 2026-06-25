"use client";

import { BarChart3, Languages, Type } from "lucide-react";

interface DailyCount {
  day: string;
  count: number;
}

interface MyActivityWidgetProps {
  translationsThisWeek: number;
  languagesUsed: number;
  charsTranslated: number;
  dailyCounts: DailyCount[];
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function MyActivityWidget({ translationsThisWeek, languagesUsed, charsTranslated, dailyCounts }: MyActivityWidgetProps) {
  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);

  return (
    <div className="h-full p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-violet-500" />
          <span className="text-xs font-semibold text-foreground">My Activity</span>
        </div>
        <span className="text-[10px] text-muted-foreground">This week</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <Languages className="h-3.5 w-3.5 mx-auto mb-1 text-violet-500" />
          <p className="text-lg font-bold leading-tight">{formatNumber(translationsThisWeek)}</p>
          <p className="text-[10px] text-muted-foreground">Translations</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <span className="text-sm">🌐</span>
          <p className="text-lg font-bold leading-tight">{languagesUsed}</p>
          <p className="text-[10px] text-muted-foreground">Languages</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <Type className="h-3.5 w-3.5 mx-auto mb-1 text-violet-500" />
          <p className="text-lg font-bold leading-tight">{formatNumber(charsTranslated)}</p>
          <p className="text-[10px] text-muted-foreground">Characters</p>
        </div>
      </div>

      {/* Mini bar chart */}
      {dailyCounts.length > 0 && (
        <div className="flex-1 flex items-end gap-1 min-h-[40px]">
          {dailyCounts.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full rounded-t bg-violet-400/70 dark:bg-violet-500/50 transition-all"
                style={{ height: `${Math.max((d.count / maxCount) * 100, 8)}%` }}
              />
              <span className="text-[9px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

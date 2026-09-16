"use client";

import { Suspense } from "react";
import { TranslateSettingsPanel } from "./settings-panel";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="text-muted-foreground animate-pulse">Loading...</div></div>}>
      <TranslateSettingsPanel />
    </Suspense>
  );
}

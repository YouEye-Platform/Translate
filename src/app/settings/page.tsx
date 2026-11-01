"use client";

import { useTranslations as useInterfaceTranslations } from "next-intl";
import { Suspense } from "react";
import { TranslateSettingsPanel } from "./settings-panel";

export default function SettingsPage() {
  const translateInterface = useInterfaceTranslations("interface");

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-48"><div className="text-muted-foreground animate-pulse">{translateInterface("m47d2a515ef2f")}</div></div>}>
      <TranslateSettingsPanel />
    </Suspense>
  );
}

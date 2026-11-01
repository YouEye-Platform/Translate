"use client";

import { useTranslations as useInterfaceTranslations } from "next-intl";
import { Suspense } from "react";
import { TranslateSettingsPanel } from "@/app/settings/settings-panel";

export default function SettingsEmbedPage() {
  const translateInterface = useInterfaceTranslations("interface");

  return (
    <Suspense fallback={<div className="flex h-48 items-center justify-center"><div className="animate-pulse text-muted-foreground">{translateInterface("m47d2a515ef2f")}</div></div>}>
      <TranslateSettingsPanel embedded />
    </Suspense>
  );
}

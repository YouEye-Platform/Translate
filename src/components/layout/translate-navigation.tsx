"use client";

import { useTranslations as useInterfaceTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages, BookOpen, Settings } from "lucide-react";

const destinations = [
  { href: "/", labelKey: "uxText", icon: Languages },
  { href: "/saved", labelKey: "mb5c120b316c2", icon: BookOpen },
  { href: "/settings", labelKey: "m74a883a037bc", icon: Settings },
];

export function TranslateNavigation() {
  const translateInterface = useInterfaceTranslations("interface");
  const pathname = usePathname();
  return (
    <nav className="translation-navigation" aria-label={translateInterface("m8fe147696fbf")}>
      {destinations.map(({ href, labelKey, icon: Icon }) => (
        <Link key={href} href={href} prefetch={false} aria-current={pathname === href ? "page" : undefined}>
          <Icon className="h-5 w-5" aria-hidden="true" />
          <span>{translateInterface(labelKey)}</span>
        </Link>
      ))}
    </nav>
  );
}

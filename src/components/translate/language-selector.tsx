"use client";

import { useLocale, useTranslations as useInterfaceTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLanguageName, type Language } from "@/lib/translate/languages";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  languages: Language[];
  placeholder?: string;
  variant?: "source" | "target";
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, languages, placeholder, variant, disabled }: LanguageSelectorProps) {
  const locale = useLocale();
  const translateInterface = useInterfaceTranslations("interface");
  const languageName = (code: string) => getLanguageName(code, locale, translateInterface("m89ebfb7a88ca"));
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        aria-label={variant === "source" ? translateInterface("m088b23e3327d") : variant === "target" ? translateInterface("mea252b75a5db") : placeholder ?? translateInterface("m71a202e24721")}
        className={variant ? "translation-language-select" : "w-full min-h-11 rounded-lg border-border bg-background"}
      >
        <SelectValue placeholder={placeholder ?? translateInterface("m71a202e24721")} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span>{languageName(lang.code)}</span>
            {lang.code !== "auto" && lang.nativeName.toLocaleLowerCase(locale) !== languageName(lang.code).toLocaleLowerCase(locale) && (
              <span className="ml-1.5 text-muted-foreground text-xs">({lang.nativeName})</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Language } from "@/lib/translate/languages";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  languages: Language[];
  placeholder?: string;
  /** "source" shows a green dot, "target" shows an orange dot */
  variant?: "source" | "target";
}

export function LanguageSelector({ value, onChange, languages, placeholder, variant }: LanguageSelectorProps) {
  const dotColor = variant === "target"
    ? "bg-orange-400"
    : "bg-emerald-400";

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full rounded-full border-border/60 bg-background px-4 h-11 gap-2 shadow-sm hover:shadow-md transition-shadow">
        {variant && (
          <span className={`h-2.5 w-2.5 rounded-full ${dotColor} shrink-0`} />
        )}
        <SelectValue placeholder={placeholder ?? "Select language"} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span>{lang.name}</span>
            {lang.nativeName !== lang.name && (
              <span className="ml-1.5 text-muted-foreground text-xs">({lang.nativeName})</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

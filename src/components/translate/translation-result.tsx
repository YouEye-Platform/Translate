"use client";

import { useTranslations as useInterfaceTranslations } from "next-intl";

import { useState } from "react";
import { Copy, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TranslationResultProps {
  translatedText: string;
  translationId?: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  loading?: boolean;
  error?: string;
  language: string;
}

export function TranslationResult({
  translatedText,
  translationId,
  isSaved,
  onToggleSave,
  loading,
  error,
  language,
}: TranslationResultProps) {
  const translateInterface = useInterfaceTranslations("interface");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="translation-result" aria-label={translateInterface("m6fbd766b1a71")} aria-busy={loading}>
      <div className="translation-output" role="status" aria-live="polite" dir="auto">
        {loading ? <p className="text-muted-foreground animate-pulse">{translateInterface("me72799b80982")}</p> : error ? (
          <div role="alert" className="translation-error"><p>{translateInterface("uxTranslationError")}</p><p className="text-sm mt-2">{error}</p></div>
        ) : translatedText ? <p className="whitespace-pre-wrap break-words">{translatedText}</p> : <p className="text-muted-foreground">{translateInterface("mda1d598bc99c")}</p>}
      </div>
      <footer>
        <span>{language}</span>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleCopy} disabled={!translatedText || loading || !!error} aria-label={copied ? translateInterface("uxTranslationCopied") : translateInterface("me61283caa8b6")} className="h-9 w-9 rounded-lg">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? translateInterface("mea61bc15688d") : translateInterface("me21f935f11d7")}</TooltipContent>
          </Tooltip>
          {translationId && onToggleSave && (
            <Button variant="ghost" size="sm" onClick={onToggleSave} aria-pressed={!!isSaved} aria-label={isSaved ? translateInterface("m61e058a17789") : translateInterface("m1d9eb7b9db2c")}>
              <Star className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />{isSaved ? translateInterface("mb5c120b316c2") : translateInterface("m1509f561f241")}
            </Button>
          )}
        </div>
      </footer>
    </section>
  );
}

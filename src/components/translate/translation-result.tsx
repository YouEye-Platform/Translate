"use client";

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
}

export function TranslationResult({
  translatedText,
  translationId,
  isSaved,
  onToggleSave,
  loading,
}: TranslationResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex flex-col rounded-2xl border border-border/60 bg-muted/20 shadow-sm min-h-[220px]">
      {/* Action buttons — top right */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
        {translationId && onToggleSave && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSave}
                aria-label={isSaved ? "Unsave translation" : "Save translation"}
                className="h-8 w-8 rounded-full"
              >
                <Star
                  className={`h-4 w-4 transition-colors ${isSaved ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isSaved ? "Unsave" : "Save"}</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={!translatedText}
              aria-label="Copy translation"
              className="h-8 w-8 rounded-full"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
        </Tooltip>
      </div>

      {/* Translation text */}
      <div className="flex-1 p-4 pr-20">
        {loading ? (
          <p className="text-muted-foreground animate-pulse text-base">Translating…</p>
        ) : translatedText ? (
          <p className="text-base whitespace-pre-wrap break-words">{translatedText}</p>
        ) : (
          <p className="text-muted-foreground/60 text-base">Translation will appear here.</p>
        )}
      </div>
    </div>
  );
}

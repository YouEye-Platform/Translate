"use client";

import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SwapButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SwapButton({ onClick, disabled }: SwapButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          aria-label="Swap languages (Ctrl+Shift+S)"
          className="h-10 w-10 rounded-full shrink-0 border-border/60 shadow-sm hover:shadow-md hover:bg-accent/60 transition-all"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Swap languages (Ctrl+Shift+S)</TooltipContent>
    </Tooltip>
  );
}

"use client";

import { useTranslations as useInterfaceTranslations } from "next-intl";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SwapButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SwapButton({ onClick, disabled }: SwapButtonProps) {
  const translateInterface = useInterfaceTranslations("interface");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          aria-label={translateInterface("mf61eb371f1c6")}
          className="h-10 w-10 rounded-lg shrink-0 border-transparent bg-transparent shadow-none hover:bg-accent"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{translateInterface("mf61eb371f1c6")}</TooltipContent>
    </Tooltip>
  );
}

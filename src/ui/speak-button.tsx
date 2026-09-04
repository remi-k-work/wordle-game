// components
import { Button } from "@base-ui/react";

// assets
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface SpeakButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  children: ReactNode;
}

// Shared speak-action chrome (riddle, definition, override) — callers keep
// their own disabled/onClick logic so domain behavior stays local.
export function SpeakButton({ children, className, ...rest }: SpeakButtonProps) {
  return (
    <Button className={className ?? "button mx-auto mt-4"} {...rest}>
      <SpeakerWaveIcon className="size-11" />
      {children}
    </Button>
  );
}

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { gameFlowVariantAtom } from "@/features/game/state/game-flow-variant";

// components
import { Button } from "@base-ui/react/button";
import { GameFlowButtonLive } from "./live";

// types
import type { ComponentPropsWithoutRef } from "react";

interface GameFlowButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  keepText?: boolean;
  onClicked?: () => void;
}

// `GameFlowButton` decides which variant to show (skeleton vs live); it only
// subscribes to the derived variant atom, so it doesn't re-render on every
// keystroke — only when the flow variant actually changes
export function GameFlowButton({ className, keepText = false, onClicked, ...rest }: GameFlowButtonProps) {
  const variant = useAtomValue(gameFlowVariantAtom);

  if (variant === "skeleton") return <GameFlowButtonSkeleton className={className} keepText={keepText} {...rest} />;
  return <GameFlowButtonLive variant={variant} className={className} keepText={keepText} onClicked={onClicked} {...rest} />;
}

export function GameFlowButtonSkeleton({ className, keepText = false, ...rest }: GameFlowButtonProps) {
  return (
    <Button className={cn("button", !keepText && "max-sm:p-1", className)} disabled {...rest}>
      &nbsp;
    </Button>
  );
}

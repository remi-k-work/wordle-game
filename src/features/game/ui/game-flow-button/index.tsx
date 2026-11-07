// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { gameFlowVariantAtom } from "@/features/game/state/game-flow-variant";

// components
import { Button } from "@base-ui/react/button";
import { GameFlowButtonLive } from "./live";

// constants
import { flowButtonClasses } from "./chrome";

// types
import type { ComponentPropsWithoutRef } from "react";

// Every prop of the button except the one this component owns: the button's action
// comes from the resolved flow variant, so a caller's `onClick` would be silently
// discarded by whichever branch renders. Making it a compile error keeps the
// contract honest (the same reason `Live` omits it below)
type GameFlowChromeProps = Omit<ComponentPropsWithoutRef<typeof Button>, "onClick">;

interface GameFlowButtonProps extends GameFlowChromeProps {
  keepText?: boolean;
  onClicked?: () => void;
}

// `GameFlowButton` decides which variant to show (skeleton vs live); it only
// subscribes to the derived variant atom, so it doesn't re-render on every
// keystroke — only when the flow variant actually changes
// The chrome props are forwarded as one spread rather than re-listed per branch:
// both variants accept the same contract, so re-stating each prop would be two
// more places to keep in sync every time the button gains one
export function GameFlowButton(props: GameFlowButtonProps) {
  const variant = useAtomValue(gameFlowVariantAtom);

  // `onClicked` is withheld from the skeleton instead of riding along with the
  // spread. A disabled skeleton has no action to notify anyone about, and leaving
  // the key on the object would put it straight onto the DOM button — an unknown
  // attribute React warns about, since the skeleton neither uses nor types it.
  // Dropping it here is what makes the skeleton's `Omit` true at runtime and not
  // only in the type
  const { onClicked, ...chromeProps } = props;

  return variant === "skeleton" ? <GameFlowButtonSkeleton {...chromeProps} /> : <GameFlowButtonLive variant={variant} {...chromeProps} onClicked={onClicked} />;
}

// Fully static and shared with `GameFlowButtonLive` (see ./chrome): a change to
// the button's base chrome has to land on the live button and its skeleton at the
// same time, or the toolbar visibly reshapes the moment the flow variant resolves
// — the same reason every other live/skeleton pair in the board states its chrome
// once
export function GameFlowButtonSkeleton({ className, keepText = false, ...rest }: Omit<GameFlowButtonProps, "onClicked">) {
  return (
    <Button className={cn(flowButtonClasses(keepText), className)} disabled {...rest}>
      &nbsp;
    </Button>
  );
}

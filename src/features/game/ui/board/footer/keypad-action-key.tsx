// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Button } from "@base-ui/react/button";

// assets
import { BackspaceIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentType } from "react";

export type KeypadAction = "BACKSPACE" | "ENTER";

// The same two action keys are rendered in two positions: beside the pool on
// wide screens and inside the pool on narrow ones, so exactly one set is visible
// per breakpoint. Tone, icon, and the action string they dispatch are a property
// of the action itself, so they are resolved from it here once instead of being
// restated (and re-kept-in-sync) at each call site
//
// The position's layout is folded into the same record rather than kept beside it
// as fragments to recombine per render: both positions of both keys are mounted
// at all times (CSS hides the unused pair), and `KeypadArea` re-renders them on
// every keystroke that repaints a key. Resolving each of the four root classes
// and each of the four icon classes once — through `cn`, here, at module scope —
// means a key render is two lookups instead of a second trip through twMerge
// over a template-literal class, and keeps this leaf on the same footing as
// `KeypadKey`, `GuessTile`, and `GuessRow`, which all state their chrome once
const ACTION_CHROME: Record<KeypadAction, Record<"area" | "pool", { Icon: ComponentType<{ className?: string }>; rootClasses: string; iconClasses: string }>> = {
  BACKSPACE: {
    area: { Icon: BackspaceIcon, rootClasses: cn("button max-md:hidden max-md:p-1 bg-destructive md:[grid-area:back]"), iconClasses: "size-9 md:size-11" },
    pool: { Icon: BackspaceIcon, rootClasses: cn("button min-h-9.5 flex-initial basis-12 p-0 bg-destructive md:hidden"), iconClasses: "size-8" },
  },
  ENTER: {
    area: { Icon: PaperAirplaneIcon, rootClasses: cn("button max-md:hidden max-md:p-1 bg-secondary md:[grid-area:enter]"), iconClasses: "size-9 md:size-11" },
    pool: { Icon: PaperAirplaneIcon, rootClasses: cn("button min-h-9.5 flex-initial basis-12 p-0 bg-secondary md:hidden"), iconClasses: "size-8" },
  },
};

interface KeypadActionKeyProps {
  action: KeypadAction;
  position: "area" | "pool";
  // Skeletons render the same key with no handler; the live variants pass theirs
  disabled?: boolean;
  onPressed?: (pressedKey: string) => void;
}

export function KeypadActionKey({ action, position, disabled = false, onPressed }: KeypadActionKeyProps) {
  // The one chrome row this key renders, for its action in its position
  const { Icon, rootClasses, iconClasses } = ACTION_CHROME[action][position];

  // The dispatched input is the action's own key, so a call site cannot render
  // Backspace chrome while sending something else to the machine. Resolved here
  // rather than by each of the two call sites pairing `action` with a literal
  const handlePressed = onPressed && (() => onPressed(action));

  return (
    <Button tabIndex={-1} className={rootClasses} disabled={disabled} onClick={handlePressed}>
      <Icon className={iconClasses} />
    </Button>
  );
}

// react
import { useCallback, useMemo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { HashMap, Option } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { overdriveHacksKeypadColorsAtom, overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// components
import { Button } from "@base-ui/react/button";
import { KeypadPool, KeypadPoolSkeleton } from "./keypad-pool";

// assets
import { BackspaceIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { Keypad } from "@/features/game/domain/models";

// constants
const EMPTY_KEY_COLOR = "" as const;

// `KeypadArea` is hoisted to module scope. Defining it inside `Footer`'s body
// would recreate its component identity on every `Footer` render, remounting
// the entire keypad subtree (AnimatePresence, motion keys, Backspace/Enter
// buttons) each time; as a module-level component its identity is stable, so
// only the atoms it actually subscribes to can re-render it
//
// `Toolbar` is intentionally rendered by `Footer` as a sibling of `KeypadArea`,
// not inside it: `KeypadArea` subscribes to keypad colors and re-renders on
// every keystroke that repaints a key; if `Toolbar` lived inside `KeypadArea`,
// the toolbar (HacksMenu, Riddle, GameLangChanger, GameFlowButton) would be
// dragged into those re-renders even though none of it depends on keypad
// state; as a sibling, `Toolbar` only re-renders when `Footer` itself
// re-renders — which happens only once, when `gameDataKeypad` flips from
// `None` to `Some`
export function KeypadArea({ keys }: { keys: Keypad }) {
  const keypadColors = useAtomValue(overdriveHacksKeypadColorsAtom);
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  // Attach each key's color once here and drop greyed-out keys; the pool then
  // only needs the keys it renders, not the full color map (and not a second
  // copy of the key-dispatch handler)
  const availableKeys = useMemo(
    () =>
      keys
        .map((letter) => ({ letter, color: Option.getOrElse(HashMap.get(keypadColors, letter), () => EMPTY_KEY_COLOR) }))
        .filter(({ color }) => color !== "grey"),
    [keys, keypadColors]
  );

  const handleKeyPressed = useCallback(
    (pressedKey: string) => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey }),
    [overdriveHacksMachineEvent]
  );

  return (
    <section className={cn("block rounded-md bg-surface-3 p-1", "md:grid md:grid-cols-[auto_1fr_auto] md:gap-2 md:[grid-template-areas:'back_pool_enter']")}>
      <KeypadPool keys={availableKeys} onPressed={handleKeyPressed} />
      <Button
        tabIndex={-1}
        className={cn("button bg-destructive", "max-md:hidden max-md:p-1", "md:[grid-area:back]")}
        onClick={() => handleKeyPressed("BACKSPACE")}
      >
        <BackspaceIcon className="size-9 md:size-11" />
      </Button>
      <Button tabIndex={-1} className={cn("button bg-secondary", "max-md:hidden max-md:p-1", "md:[grid-area:enter]")} onClick={() => handleKeyPressed("ENTER")}>
        <PaperAirplaneIcon className="size-9 md:size-11" />
      </Button>
    </section>
  );
}

export function KeypadAreaSkeleton() {
  return (
    <section className={cn("block rounded-md bg-surface-3 p-1", "md:grid md:grid-cols-[auto_1fr_auto] md:gap-2 md:[grid-template-areas:'back_pool_enter']")}>
      <KeypadPoolSkeleton />
      <Button tabIndex={-1} className={cn("button bg-destructive", "max-md:hidden max-md:p-1", "md:[grid-area:back]")} disabled>
        <BackspaceIcon className="size-9 md:size-11" />
      </Button>
      <Button tabIndex={-1} className={cn("button bg-secondary", "max-md:hidden max-md:p-1", "md:[grid-area:enter]")} disabled>
        <PaperAirplaneIcon className="size-9 md:size-11" />
      </Button>
    </section>
  );
}

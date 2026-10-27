// react
import { useCallback, useMemo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { HashMap, Option } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameDataKeypadAtom } from "@/features/game/state/game-data";
import { overdriveHacksKeypadColorsAtom, overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// components
import { Button } from "@base-ui/react/button";
import { Toolbar, ToolbarSkeleton } from "./toolbar";
import { KeypadPool, KeypadPoolSkeleton } from "./keypad-pool";

// assets
import { BackspaceIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { Color, Keypad } from "@/features/game/domain/models";
import type { KeypadPoolEntry } from "./keypad-pool";

export function Footer() {
  const gameDataKeypad = useAtomValue(gameDataKeypadAtom);

  // Early return before any memo: the keyed area owns its own hooks
  if (Option.isNone(gameDataKeypad)) return <FooterSkeleton />;
  return <KeypadArea keys={gameDataKeypad.value} />;
}

function KeypadArea({ keys }: { keys: Keypad }) {
  const keypadColors = useAtomValue(overdriveHacksKeypadColorsAtom);
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  // Attach each key's color once here and drop greyed-out keys. The pool then
  // only needs the keys it renders, not the full color map (and not a second
  // copy of the key-dispatch handler)
  const availableKeys = useMemo<KeypadPoolEntry[]>(
    () =>
      keys.map((letter) => ({ letter, color: Option.getOrElse(HashMap.get(keypadColors, letter), () => "" as Color) })).filter(({ color }) => color !== "grey"),
    [keys, keypadColors]
  );

  const handleKeyPressed = useCallback(
    (pressedKey: string) => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey }),
    [overdriveHacksMachineEvent]
  );

  return (
    <footer className="grid gap-1">
      <Toolbar />

      <section className={cn("block rounded-md bg-surface-3 p-1", "md:grid md:grid-cols-[auto_1fr_auto] md:gap-2 md:[grid-template-areas:'back_pool_enter']")}>
        <KeypadPool keys={availableKeys} onPressed={handleKeyPressed} />
        <Button
          tabIndex={-1}
          className={cn("button bg-destructive", "max-md:hidden max-md:p-1", "md:[grid-area:back]")}
          onClick={() => handleKeyPressed("BACKSPACE")}
        >
          <BackspaceIcon className="size-9 md:size-11" />
        </Button>
        <Button
          tabIndex={-1}
          className={cn("button bg-secondary", "max-md:hidden max-md:p-1", "md:[grid-area:enter]")}
          onClick={() => handleKeyPressed("ENTER")}
        >
          <PaperAirplaneIcon className="size-9 md:size-11" />
        </Button>
      </section>
    </footer>
  );
}

export function FooterSkeleton() {
  return (
    <footer className="grid gap-1">
      <ToolbarSkeleton />

      <section className={cn("block rounded-md bg-surface-3 p-1", "md:grid md:grid-cols-[auto_1fr_auto] md:gap-2 md:[grid-template-areas:'back_pool_enter']")}>
        <KeypadPoolSkeleton />
        <Button tabIndex={-1} className={cn("button bg-destructive", "max-md:hidden max-md:p-1", "md:[grid-area:back]")} disabled>
          <BackspaceIcon className="size-9 md:size-11" />
        </Button>
        <Button tabIndex={-1} className={cn("button bg-secondary", "max-md:hidden max-md:p-1", "md:[grid-area:enter]")} disabled>
          <PaperAirplaneIcon className="size-9 md:size-11" />
        </Button>
      </section>
    </footer>
  );
}

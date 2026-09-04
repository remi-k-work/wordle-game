// react
import { useCallback, useMemo } from "react";

// services, features, and other libraries
import { HashMap, Option } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameDataKeypadAtom } from "@/features/game/state";
import { overdriveHacksKeypadColorsAtom, overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state";

// components
import { Button } from "@base-ui/react";
import { Toolbar, ToolbarSkeleton } from "./toolbar";
import { KeypadPool, KeypadPoolSkeleton } from "./keypad-pool";

// assets
import { BackspaceIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { Color } from "@/features/game/domain";

export function Footer() {
  const gameDataKeypad = useAtomValue(gameDataKeypadAtom);
  const keypadColors = useAtomValue(overdriveHacksKeypadColorsAtom);
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  // Memoized before the early return so hook order stays stable when the keypad is unavailable
  const availableKeys = useMemo(
    () =>
      Option.match(gameDataKeypad, {
        onNone: () => undefined,
        // Dynamically filter out the grey keys
        onSome: (keys) => keys.filter((key) => Option.getOrElse(HashMap.get(keypadColors, key), () => "" as Color) !== "grey"),
      }),
    [gameDataKeypad, keypadColors]
  );

  const handleKeyPressed = useCallback(
    (pressedKey: string) => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey }),
    [overdriveHacksMachineEvent]
  );

  if (!availableKeys) return <FooterSkeleton />;

  return (
    <footer className="grid gap-1">
      <Toolbar />

      <section className="grid grid-cols-2 gap-2 rounded-md bg-surface-3 p-1 [grid-template-areas:'pool_pool''back_enter'] md:grid-cols-[auto_1fr_auto] md:[grid-template-areas:'back_pool_enter']">
        <KeypadPool availableKeys={availableKeys} keypadColors={keypadColors} onPressed={handleKeyPressed} />
        <Button tabIndex={-1} className="button bg-destructive [grid-area:back] max-md:p-1" onClick={() => handleKeyPressed("BACKSPACE")}>
          <BackspaceIcon className="size-9 md:size-11" />
        </Button>
        <Button tabIndex={-1} className="button bg-secondary [grid-area:enter] max-md:p-1" onClick={() => handleKeyPressed("ENTER")}>
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

      <section className="grid grid-cols-2 gap-2 rounded-md bg-surface-3 p-1 [grid-template-areas:'pool_pool''back_enter'] md:grid-cols-[auto_1fr_auto] md:[grid-template-areas:'back_pool_enter']">
        <KeypadPoolSkeleton />
        <Button tabIndex={-1} className="button bg-destructive [grid-area:back] max-md:p-1" disabled>
          <BackspaceIcon className="size-9 md:size-11" />
        </Button>
        <Button tabIndex={-1} className="button bg-secondary [grid-area:enter] max-md:p-1" disabled>
          <PaperAirplaneIcon className="size-9 md:size-11" />
        </Button>
      </section>
    </footer>
  );
}

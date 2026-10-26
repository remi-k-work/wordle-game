// react
import { useCallback } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { HashMap, Option } from "effect";
import { useAtomSet } from "@effect/atom-react";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { AnimatePresence } from "motion/react";

// components
import { Button } from "@base-ui/react/button";
import { KeypadKey, KeypadKeySkeleton } from "./keypad-key";

// assets
import { BackspaceIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// types
import type { Color } from "@/features/game/domain/models";

interface KeypadPoolProps {
  availableKeys: ReadonlyArray<string>;
  keypadColors: HashMap.HashMap<string, Color>;
  onPressed: (pressedKey: string) => void;
}

// constants
import { ALPHABET } from "@/features/game/ui/board/constants";

export function KeypadPool({ availableKeys, keypadColors, onPressed }: KeypadPoolProps) {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  const handleKeyPressed = useCallback(
    (pressedKey: string) => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey }),
    [overdriveHacksMachineEvent]
  );

  return (
    <div className="flex flex-wrap justify-center gap-1 [grid-area:pool]">
      <AnimatePresence mode="sync">
        {availableKeys.map((key) => (
          <KeypadKey key={key} pressKey={key} keyColor={Option.getOrNull(HashMap.get(keypadColors, key))} onPressed={onPressed} />
        ))}
      </AnimatePresence>
      <Button
        tabIndex={-1}
        className={cn("button min-h-9.5 flex-initial basis-12 bg-destructive p-0", "md:hidden")}
        onClick={() => handleKeyPressed("BACKSPACE")}
      >
        <BackspaceIcon className="size-8" />
      </Button>
      <Button tabIndex={-1} className={cn("button min-h-9.5 flex-initial basis-12 bg-secondary p-0", "md:hidden")} onClick={() => handleKeyPressed("ENTER")}>
        <PaperAirplaneIcon className="size-8" />
      </Button>
    </div>
  );
}

export function KeypadPoolSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-1 [grid-area:pool]">
      {ALPHABET.map((key) => (
        <KeypadKeySkeleton key={key} pressKey={key} />
      ))}
      <Button tabIndex={-1} className={cn("button min-h-9.5 flex-initial basis-12 bg-destructive p-0", "md:hidden")} disabled>
        <BackspaceIcon className="size-8" />
      </Button>
      <Button tabIndex={-1} className={cn("button min-h-9.5 flex-initial basis-12 bg-secondary p-0", "md:hidden")} disabled>
        <PaperAirplaneIcon className="size-8" />
      </Button>
    </div>
  );
}

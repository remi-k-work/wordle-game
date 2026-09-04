// services, features, and other libraries
import { HashMap, Option } from "effect";
import { AnimatePresence } from "motion/react";

// components
import { KeypadKey, KeypadKeySkeleton } from "./keypad-key";

// types
import type { Color } from "@/features/game/domain";

interface KeypadPoolProps {
  availableKeys: ReadonlyArray<string>;
  keypadColors: HashMap.HashMap<string, Color>;
  onPressed: (pressedKey: string) => void;
}

// constants
import { ALPHABET } from "@/features/game/ui/board/constants";

export function KeypadPool({ availableKeys, keypadColors, onPressed }: KeypadPoolProps) {
  return (
    <div className="flex flex-wrap justify-center gap-1 [grid-area:pool]">
      <AnimatePresence mode="sync">
        {availableKeys.map((key) => (
          <KeypadKey key={key} pressKey={key} keyColor={Option.getOrNull(HashMap.get(keypadColors, key))} onPressed={onPressed} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function KeypadPoolSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-1 [grid-area:pool]">
      {ALPHABET.map((key) => (
        <KeypadKeySkeleton key={key} pressKey={key} />
      ))}
    </div>
  );
}

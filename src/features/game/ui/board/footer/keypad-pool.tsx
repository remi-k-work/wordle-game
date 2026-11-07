// services, features, and other libraries
import { AnimatePresence } from "motion/react";

// components
import { KeypadKey, KeypadKeySkeleton } from "./keypad-key";
import { KeypadActionKeys } from "./keypad-action-keys";

// types
import type { Color } from "@/features/game/domain/models";

interface KeypadPoolEntry {
  letter: string;
  color: Color;
}

interface KeypadPoolProps {
  keys: ReadonlyArray<KeypadPoolEntry>;
  onPressed: (pressedKey: string) => void;
}

// constants
import { ALPHABET } from "@/features/game/ui/board/constants";

// Fully static class string, hoisted so the live pool and its skeleton re-run
// neither it through twMerge. The `[grid-area:pool]` name has to agree with the
// area shell's `[grid-template-areas:…]` (see `KeypadArea`), so the pool's slot is
// stated once for both variants instead of twice
const POOL_ROOT_CLASSES = "flex flex-wrap justify-center gap-1 [grid-area:pool]";

export function KeypadPool({ keys, onPressed }: KeypadPoolProps) {
  return (
    <div className={POOL_ROOT_CLASSES}>
      <AnimatePresence mode="sync">
        {keys.map(({ letter, color }) => (
          <KeypadKey key={letter} letter={letter} color={color} onPressed={onPressed} />
        ))}
      </AnimatePresence>
      <KeypadActionKeys position="pool" onPressed={onPressed} />
    </div>
  );
}

export function KeypadPoolSkeleton() {
  return (
    <div className={POOL_ROOT_CLASSES}>
      {ALPHABET.map((letter) => (
        <KeypadKeySkeleton key={letter} letter={letter} />
      ))}
      <KeypadActionKeys position="pool" disabled />
    </div>
  );
}

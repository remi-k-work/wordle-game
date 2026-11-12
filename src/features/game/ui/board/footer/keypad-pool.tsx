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

// The skeleton is handed the active language's letters (see
// KEYPAD_SKELETON_LETTERS) so the placeholder has the same key count as the pool
// that replaces it — Polish loads 32 keys, English 26
export function KeypadPoolSkeleton({ letters }: { letters: ReadonlyArray<string> }) {
  return (
    <div className={POOL_ROOT_CLASSES}>
      {letters.map((letter) => (
        <KeypadKeySkeleton key={letter} letter={letter} />
      ))}
      <KeypadActionKeys position="pool" disabled />
    </div>
  );
}

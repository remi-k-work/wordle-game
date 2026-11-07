// react
import { useCallback } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { HashMap, Option } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { overdriveHacksKeypadColorsAtom, overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// components
import { KeypadPool, KeypadPoolSkeleton } from "./keypad-pool";
import { KeypadActionKeys } from "./keypad-action-keys";

// types
import type { Keypad } from "@/features/game/domain/models";

// constants
const EMPTY_KEY_COLOR = "" as const;

// Fully static class string, hoisted so neither the live keypad nor its
// skeleton re-runs it through twMerge — the two must render the same shell
const KEYPAD_AREA_CLASSES = cn("block rounded-md bg-surface-3 p-1", "md:grid md:grid-cols-[auto_1fr_auto] md:gap-2 md:[grid-template-areas:'back_pool_enter']");

// `KeypadArea` is hoisted to module scope. Defining it inside `Footer`'s body
// would recreate its component identity on every `Footer` render, remounting
// the entire keypad subtree (AnimatePresence, motion keys, Backspace/Enter
// buttons) each time; as a module-level component its identity is stable, so
// only the atoms it actually subscribes to can re-render it
//
// `Toolbar` is intentionally rendered by `Footer` as a sibling of `KeypadArea`,
// not inside it: `KeypadArea` subscribes to keypad colors and re-renders on
// every keystroke that repaints a key; if `Toolbar` lived inside `KeypadArea`, the
// toolbar (HacksMenu, Riddle, GameLangChanger, GameFlowButton) would be dragged
// into those re-renders even though none of it depends on keypad state; as a
// sibling, `Toolbar` only re-renders when `Footer` itself re-renders — which
// happens only once, when `gameDataKeypad` flips from `None` to `Some`
export function KeypadArea({ keys }: { keys: Keypad }) {
  const keypadColors = useAtomValue(overdriveHacksKeypadColorsAtom);
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);

  // Attach each key's color and drop greyed-out keys; the pool only needs the
  // keys it renders; `KeypadPool` destructures `letter`/`color` to primitives,
  // and `KeypadKey` is memoized, so unchanged keys bail out by value even
  // though `availableKeys` is a new array each render; `KeypadArea` re-renders
  // only when `keypadColors` changes (its sole atom subscription), so a
  // `useMemo` here would never cache across renders — the derivation runs on
  // every render either way
  const availableKeys = keys
    .map((letter) => ({ letter, color: Option.getOrElse(HashMap.get(keypadColors, letter), () => EMPTY_KEY_COLOR) }))
    .filter(({ color }) => color !== "grey");

  const handleKeyPressed = useCallback(
    (pressedKey: string) => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey }),
    [overdriveHacksMachineEvent]
  );

  return (
    <section className={KEYPAD_AREA_CLASSES}>
      <KeypadPool keys={availableKeys} onPressed={handleKeyPressed} />
      <KeypadActionKeys position="area" onPressed={handleKeyPressed} />
    </section>
  );
}

export function KeypadAreaSkeleton() {
  return (
    <section className={KEYPAD_AREA_CLASSES}>
      <KeypadPoolSkeleton />
      <KeypadActionKeys position="area" disabled />
    </section>
  );
}

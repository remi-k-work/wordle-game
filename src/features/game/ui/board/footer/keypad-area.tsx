// react
import { useCallback } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Array, HashMap, Option, Result } from "effect";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { overdriveHacksKeypadColorsAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { keyboardMachineSendAtom } from "@/features/game/state/keyboard";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";

// components
import { KeypadPool, KeypadPoolSkeleton } from "./keypad-pool";
import { KeypadActionKeys } from "./keypad-action-keys";

// types
import type { Keypad } from "@/features/game/domain/models";

// constants
import { KEYPAD_SKELETON_LETTERS } from "@/features/game/domain/constants";

const EMPTY_KEY_COLOR = "" as const;
const KEYPAD_AREA_CLASSES = cn("block rounded-md bg-surface-3 p-1", "md:grid md:grid-cols-[auto_1fr_auto] md:gap-2 md:[grid-template-areas:'back_pool_enter']");

export function KeypadArea({ keys }: { keys: Keypad }) {
  const keypadColors = useAtomValue(overdriveHacksKeypadColorsAtom);
  const keyboardMachineEvent = useAtomSet(keyboardMachineSendAtom);

  const availableKeys = Array.filterMap(keys, (letter) => {
    // Absent keys (nothing guessed yet) carry the empty color; only keys the player has genuinely ruled out are dropped
    const color = Option.getOrElse(HashMap.get(keypadColors, letter), () => EMPTY_KEY_COLOR);
    return color === "grey" ? Result.failVoid : Result.succeed({ letter, color });
  });

  const handleKeyPressed = useCallback((pressedKey: string) => keyboardMachineEvent({ type: "keyPressed", pressedKey }), [keyboardMachineEvent]);

  return (
    <section className={KEYPAD_AREA_CLASSES}>
      <KeypadPool keys={availableKeys} onPressed={handleKeyPressed} />
      <KeypadActionKeys position="area" onPressed={handleKeyPressed} />
    </section>
  );
}

export function KeypadAreaSkeleton() {
  // The placeholder shows the active language's keys, so the skeleton has the
  // same key count as the pool that replaces it (32 for Polish, 26 for English)
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);

  return (
    <section className={KEYPAD_AREA_CLASSES}>
      <KeypadPoolSkeleton letters={KEYPAD_SKELETON_LETTERS[solutionsLanguage]} />
      <KeypadActionKeys position="area" disabled />
    </section>
  );
}

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { gameFlowVariantAtom } from "@/features/game/state";

// types
import type { GameFlowVariant } from "@/features/game/state";

// The variant is derived inside the atom graph: the button re-renders only
// when the variant string actually changes, not on every machine snapshot
export function useGameFlowVariant(): GameFlowVariant {
  return useAtomValue(gameFlowVariantAtom);
}

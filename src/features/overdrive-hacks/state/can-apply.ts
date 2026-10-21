// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { gameFlowMachineAtom } from "@/features/game/state/game-flow";
import { runSessionRunScoreAtom } from "@/features/game/state/run-session";

// types
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain/constants";

// Determines whether a specific overdrive hack can be used (the player must be able to afford it and the game must be running)
// Kept separate from the overdrive-hacks state module so the machine can read it without a circular import
export const overdriveHacksCanApplyHackAtom = Atom.family((overdriveHackId: OverdriveHackId) =>
  Atom.make((get) => {
    const gameFlowMachineSnapshot = get(gameFlowMachineAtom);
    const runScore = get(runSessionRunScoreAtom);
    return gameFlowMachineSnapshot.matches("playing") && runScore >= OVERDRIVE_HACK_COST(overdriveHackId);
  })
);

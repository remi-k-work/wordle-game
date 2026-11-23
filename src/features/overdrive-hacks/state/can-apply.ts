// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { runSessionMachineAtom, runSessionRunScoreAtom } from "@/features/game/state/run-session";

// types
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain/constants";

// Presentation hint for the hack menu: the player can afford this hack while a
// word is in progress; the machine owns the actual transition decision; this atom
// only drives disabled styling; kept separate from the overdrive-hacks state
// module so UI readers do not depend on its machine/action graph
export const overdriveHacksCanApplyHackAtom = Atom.family((overdriveHackId: OverdriveHackId) =>
  Atom.make((get) => {
    const runSessionMachineSnapshot = get(runSessionMachineAtom);
    const runScore = get(runSessionRunScoreAtom);
    return runSessionMachineSnapshot.matches({ active: "playing" }) && runScore >= OVERDRIVE_HACK_COST(overdriveHackId);
  })
);

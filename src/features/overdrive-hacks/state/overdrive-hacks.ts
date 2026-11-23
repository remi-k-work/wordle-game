// services, features, and other libraries
import { Array, HashMap, Option } from "effect";
import { Atom } from "effect/reactivity";
import { createActorAtoms } from "@xstate/effect/atom";
import { RuntimeAtom } from "@/lib/runtime-client";
import { overdriveHacksMachine } from "@/features/overdrive-hacks/machines/overdrive-hacks";
import { sonarVowelByPosition } from "@/features/overdrive-hacks/domain/sonar";
import { wordChallengeKeypadColorsAtom, wordChallengeWordleGridAtom } from "@/features/game/state/word-challenge";
import { runSessionRunScoreAtom } from "@/features/game/state/run-session";
import { createMachineState } from "@/lib/machine-atoms";

// types
import type { BoardTile } from "@/features/game/domain/models";
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";

// constants
import { EMPTY_TILE_KEY } from "@/features/game/domain/constants";

const overdriveHacksMachineBag = createActorAtoms(RuntimeAtom, overdriveHacksMachine);
export const { snapshot: overdriveHacksMachineAtom, send: overdriveHacksMachineSendAtom } = createMachineState(overdriveHacksMachine, overdriveHacksMachineBag);

// The supported way for UI code to request a hack: it reads the current run
// score at send time, so a stale render never assembles an outdated payload.
// Affordability is still the machine's decision; the guard is authoritative.
export const requestOverdriveHackAtom = Atom.family((overdriveHackId: OverdriveHackId) =>
  Atom.writable<null, void>(
    () => null,
    (ctx) => {
      const runScore = ctx.get(runSessionRunScoreAtom);
      ctx.set(overdriveHacksMachineSendAtom, { type: "hackRequested", overdriveHackId, runScore });
    }
  )
);

// Specialized selectors for granular state access and optimized re-renders
export const overdriveHacksEmpNukedLettersAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.empNukedLetters));
export const overdriveHacksSonarRevealsAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.sonarReveals));
export const overdriveHacksTheOverrideAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theOverride));
export const overdriveHacksTheOverrideAudioAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theOverrideAudio));
export const overdriveHacksIsApplyingOverrideAtom = overdriveHacksMachineAtom.pipe(
  Atom.map((snapshot) => snapshot.matches({ active: "applyingOverrideHack" }))
);
export const overdriveHacksIsIdleAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("idle")));

export const overdriveHacksKeypadColorsAtom = Atom.make((get) =>
  Array.reduce(get(overdriveHacksEmpNukedLettersAtom), get(wordChallengeKeypadColorsAtom), (acc, letter) => HashMap.set(acc, letter, "grey"))
);

// Projection for the rendered board: one grid, each tile stating whether it is a
// sonar reveal. Stated here rather than in the row component so the memoized
// row/tile leaves only ever receive primitives, and so the board never has to
// subscribe to (and diff) a second grid to find out which tiles glow
// Sonar state remains separate from player guesses; the current-guess component
// derives its own reveals from the same `sonarReveals` selector
export const overdriveHacksWordleGridAtom = Atom.make((get) => {
  const wordleGrid = get(wordChallengeWordleGridAtom);
  const reveals = get(overdriveHacksSonarRevealsAtom);

  // A tile is a reveal when the base grid leaves its position empty and a reveal
  // fills it — a letter the player typed is never a reveal. The annotation runs
  // for every grid, with or without reveals (empty reveals simply leave all
  // tiles plain), so the board always renders one uniform grid shape instead of
  // a projection that sometimes carries the flag and sometimes does not
  const vowelByPosition = sonarVowelByPosition(reveals);

  return Array.map(wordleGrid, (row) =>
    Array.map(row, (tile, index): BoardTile => {
      // A tile is only a reveal when the base grid leaves its position empty:
      // a letter the player typed is never a reveal
      const reveal = Option.filter(HashMap.get(vowelByPosition, index), () => tile.tileKey === EMPTY_TILE_KEY);

      return Option.match(reveal, {
        onNone: () => ({ ...tile, isSonarReveal: false }),
        onSome: (letter) => ({ tileKey: letter, color: "green", isSonarReveal: true }),
      });
    })
  );
});

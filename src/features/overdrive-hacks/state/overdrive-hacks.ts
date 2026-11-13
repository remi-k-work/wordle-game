// services, features, and other libraries
import { Array, HashMap, Option } from "effect";
import { Atom } from "effect/reactivity";
import { overdriveHacksMachine } from "@/features/overdrive-hacks/machines/overdrive-hacks";
import { sonarVowelByPosition } from "@/features/overdrive-hacks/domain/sonar";
import { wordChallengeKeypadColorsAtom, wordChallengeWordleGridAtom } from "@/features/game/state/word-challenge";
import { createMachineAtom } from "@/domain/machine-atom";

// types
import type { BoardTile } from "@/features/game/domain/models";

// constants
import { EMPTY_TILE_KEY } from "@/features/game/domain/constants";

// The overdrive hacks machine is now a living actor inside the effect atom
export const overdriveHacksMachineAtom = createMachineAtom(overdriveHacksMachine);

// Specialized selectors for granular state access and optimized re-renders
export const overdriveHacksEmpNukedLettersAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.empNukedLetters));
export const overdriveHacksSonarRevealsAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.sonarReveals));
export const overdriveHacksTheOverrideAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theOverride));
export const overdriveHacksTheOverrideAudioAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theOverrideAudio));

// Derived boolean: subscribe to this instead of the full snapshot when only
// the machine state (not context) is needed
export const overdriveHacksIsApplyingOverrideAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.matches("applyingOverrideHack")));
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

  return wordleGrid.map((row) =>
    row.map((tile, index): BoardTile =>
      Option.match(HashMap.get(vowelByPosition, index), {
        // A tile is only a reveal when the base grid leaves its position empty:
        // a letter the player typed is never a reveal
        onNone: () => ({ ...tile, isSonarReveal: false }),
        onSome: (vowel) => (tile.tileKey === EMPTY_TILE_KEY ? { tileKey: vowel, color: "green", isSonarReveal: true } : { ...tile, isSonarReveal: false }),
      })
    )
  );
});

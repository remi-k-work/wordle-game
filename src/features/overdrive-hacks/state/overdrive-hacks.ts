// services, features, and other libraries
import { Array, HashMap, pipe } from "effect";
import { Atom } from "effect/reactivity";
import { overdriveHacksMachine } from "@/features/overdrive-hacks/machines/overdrive-hacks";
import { sonarVowelByPosition } from "@/features/overdrive-hacks/domain/sonar";
import { wordChallengeKeypadColorsAtom, wordChallengeWordleGridAtom } from "@/features/game/state/word-challenge";
import { createMachineAtom } from "@/domain/machine-atom";

// types
import type { Color, Tile } from "@/features/game/domain/models";

export { overdriveHacksCanApplyHackAtom } from "./can-apply";

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
  pipe(
    get(overdriveHacksEmpNukedLettersAtom),
    Array.reduce(get(wordChallengeKeypadColorsAtom), (acc, letter) => HashMap.set(acc, letter, "grey" as Color))
  )
);

// Projection for completed rows. Sonar state remains separate from player guesses;
// the current-guess component can use the same reveal selector when it gains final visuals
export const overdriveHacksWordleGridAtom = Atom.make((get) => {
  const wordleGrid = get(wordChallengeWordleGridAtom);
  const reveals = get(overdriveHacksSonarRevealsAtom);
  if (reveals.length === 0) return wordleGrid;

  const vowelByPosition = sonarVowelByPosition(reveals);

  return wordleGrid.map((row) =>
    row.map((tile, index) => {
      const vowel = vowelByPosition.get(index);
      return vowel === undefined || tile.tileKey !== "" ? tile : ({ tileKey: vowel, color: "green" } as const satisfies Tile);
    })
  );
});

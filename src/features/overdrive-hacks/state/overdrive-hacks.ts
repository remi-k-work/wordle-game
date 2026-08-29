// services, features, and other libraries
import { Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { overdriveHacksMachine } from "@/features/overdrive-hacks/machines/overdrive-hacks";
import { gameFlowMachineAtom, runSessionRunScoreAtom, wordChallengeKeypadColorsAtom, wordChallengeWordleGridAtom } from "@/features/game/state";
import { createMachineAtom } from "@/lib/machine-atom";
import { formatTextForTTS } from "@/lib/formatters";

// types
import type { Color, Tile, WordleGrid } from "@/features/game/domain";
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain";

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain";

// The overdrive hacks machine is now a living actor inside the effect atom
export const overdriveHacksMachineAtom = createMachineAtom(overdriveHacksMachine);

// Specialized selectors for granular state access and optimized re-renders
export const overdriveHacksEmpNukedLettersAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.empNukedLetters));
export const overdriveHacksSonarRevealsAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.sonarReveals));
export const overdriveHacksTheOverrideAtom = overdriveHacksMachineAtom.pipe(Atom.map((snapshot) => snapshot.context.theOverride));

export const overdriveHacksKeypadColorsAtom = Atom.make((get) => {
  const colors = { ...get(wordChallengeKeypadColorsAtom) } as Record<string, Color | undefined>;
  for (const letter of get(overdriveHacksEmpNukedLettersAtom)) colors[letter] = "grey";
  return colors;
});

// Projection for completed rows. Sonar state remains separate from player guesses;
// the current-guess component can use the same reveal selector when it gains final visuals.
export const overdriveHacksWordleGridAtom = Atom.make((get) => {
  const wordleGrid = get(wordChallengeWordleGridAtom);
  const reveals = get(overdriveHacksSonarRevealsAtom);
  if (reveals.length === 0) return wordleGrid;

  return wordleGrid.map((row) =>
    row.map((tile, index) => {
      const reveal = reveals.find((candidate) => candidate.positions.includes(index));
      return reveal === undefined || tile.tileKey !== "" ? tile : ({ tileKey: reveal.vowel, color: "green" } as const satisfies Tile);
    })
  ) as WordleGrid;
});

// Determines whether a specific overdrive hack can be used (the player must be able to afford it and the game must be running)
export const overdriveHacksCanApplyHackAtom = Atom.family((overdriveHackId: OverdriveHackId) =>
  Atom.make((get) => {
    const gameFlowMachineSnapshot = get(gameFlowMachineAtom);
    const runScore = get(runSessionRunScoreAtom);
    return gameFlowMachineSnapshot.matches("playing") && runScore >= OVERDRIVE_HACK_COST(overdriveHackId);
  })
);

// The override text with Markdown stripped and whitespace collapsed for TTS
export const overdriveHacksSanitizedOverrideAtom = Atom.make((get) => get(overdriveHacksTheOverrideAtom).pipe(Option.map(formatTextForTTS), Option.getOrNull));

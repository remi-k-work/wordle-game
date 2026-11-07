// react
import { memo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentGuessWordAtom, wordChallengeIsRejectedAtom } from "@/features/game/state/word-challenge";
import { overdriveHacksSonarRevealsAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { sonarVowelByPosition } from "@/features/overdrive-hacks/domain/sonar";

// components
import { GuessTile } from "./guess-tile";

// types
import type { Tile, WordChallenge } from "@/features/game/domain/models";
import type { OverdriveHacks } from "@/features/overdrive-hacks/domain/models";

// constants
// The typing row lays its tiles out on the same tracks as the rows around it, so
// the letters stay aligned with the guesses above and below (see `ROW_CLASSES`)
import { ROW_CLASSES } from "./constants";
import { WORD_LENGTH } from "@/features/game/domain/constants";

// The one class the row adds beyond its grid track, keyed by the reason it is
// being added. `CurrentGuess` is the only component in the app that re-renders
// on every keystroke, so the row's chrome is resolved once here rather than
// re-merged through twMerge on each one — the same stance `GuessRow`,
// `KeypadActionKey`, and `KeypadKey` take for their own chrome
const CURRENT_GUESS_ROW_CLASSES = {
  // A rejected guess pulses the letters it is rejecting
  rejected: cn(ROW_CLASSES, "animate-pulse"),
  accepted: cn(ROW_CLASSES),
} as const;

// One tile of the typing row, plus the two presentation facts it carries.
// They are resolved in `buildCurrentGuessTiles` — which already walked the
// typed letters and the reveals to decide what each tile holds — rather than
// being re-derived per tile from index arithmetic in a child component. Keeping
// them on the tile means the rule for "which tile bounces" and "which tile
// glows" exists in exactly one place
interface CurrentGuessTile extends Tile {
  // Bounces: the most recently typed letter. A sonar reveal can never be the
  // last typed tile, since reveals only fill positions past the typed ones
  isLastTyped: boolean;
  // Glows: a vowel the sonar revealed, not one the player typed themselves
  isSonarReveal: boolean;
}

// One row of current-guess tiles: typed letters first, then any sonar-revealed
// vowels, then the remaining empty positions
function buildCurrentGuessTiles(
  currentGuessWord: WordChallenge["currentGuessWord"],
  isInvalidGuess: boolean,
  sonarReveals: OverdriveHacks["sonarReveals"]
): CurrentGuessTile[] {
  // O(1) tile lookup: flatten reveal positions once instead of scanning per tile
  const vowelByPosition = sonarVowelByPosition(sonarReveals);
  const currentLength = currentGuessWord.length;

  return Array.from({ length: WORD_LENGTH }, (_, position): CurrentGuessTile => {
    const typedLetter = currentGuessWord[position];
    if (typedLetter !== undefined) {
      return { tileKey: typedLetter, color: isInvalidGuess ? "red" : "", isLastTyped: typedLetter !== "" && position === currentLength - 1, isSonarReveal: false };
    }

    const sonarVowel = vowelByPosition.get(position);
    return sonarVowel ? { tileKey: sonarVowel, color: "green", isLastTyped: false, isSonarReveal: true } : { tileKey: "", color: "", isLastTyped: false, isSonarReveal: false };
  });
}

// `CurrentGuess` owns no props, so React would re-render it by default whenever
// `Main` re-renders (e.g. on a turn change). `memo` bails out at the component
// boundary instead, so the tile array below is only rebuilt when the atoms it
// actually subscribes to change. Nothing here memoizes the tiles: the row only
// ever re-renders because one of its own atoms moved, so the tiles it hands
// down always carry a value that changed
export const CurrentGuess = memo(function CurrentGuess() {
  const isInvalidGuess = useAtomValue(wordChallengeIsRejectedAtom);
  const currentGuessWord = useAtomValue(wordChallengeCurrentGuessWordAtom);
  const sonarReveals = useAtomValue(overdriveHacksSonarRevealsAtom);

  const currentGuessTiles = buildCurrentGuessTiles(currentGuessWord, isInvalidGuess, sonarReveals);

  return (
    <div className={CURRENT_GUESS_ROW_CLASSES[isInvalidGuess ? "rejected" : "accepted"]}>
      {currentGuessTiles.map(({ tileKey, color, isLastTyped, isSonarReveal }, tileIndex) => (
        <GuessTile key={tileIndex} tileKey={tileKey} color={color} bounceAnim={isLastTyped} isSonarReveal={isSonarReveal} />
      ))}
    </div>
  );
});

// react
import { useMemo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentGuessWordAtom, wordChallengeIsRejectedAtom } from "@/features/game/state/word-challenge";
import { overdriveHacksSonarRevealsAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { sonarVowelByPosition } from "@/features/overdrive-hacks/domain/sonar";

// components
import { CurrentGuessTile } from "./current-guess-tile";

// types
import type { Tile, WordChallenge } from "@/features/game/domain/models";
import type { OverdriveHacks } from "@/features/overdrive-hacks/domain/models";

// constants
import { WORD_LENGTH } from "@/features/game/domain/constants";

// One row of current-guess tiles: typed letters first, then any sonar-revealed vowels, then the remaining empty positions
function buildCurrentGuessTiles(
  currentGuessWord: WordChallenge["currentGuessWord"],
  isInvalidGuess: boolean,
  sonarReveals: OverdriveHacks["sonarReveals"]
): Tile[] {
  // O(1) tile lookup: flatten reveal positions once instead of scanning per tile
  const vowelByPosition = sonarVowelByPosition(sonarReveals);

  return Array.from({ length: WORD_LENGTH }, (_, position): Tile => {
    const typedLetter = currentGuessWord[position];
    if (typedLetter !== undefined) return { tileKey: typedLetter, color: isInvalidGuess ? "red" : "" };

    const sonarVowel = vowelByPosition.get(position);
    return sonarVowel ? { tileKey: sonarVowel, color: "green" } : { tileKey: "", color: "" };
  });
}

export function CurrentGuess() {
  const isInvalidGuess = useAtomValue(wordChallengeIsRejectedAtom);
  const currentGuessWord = useAtomValue(wordChallengeCurrentGuessWordAtom);
  const sonarReveals = useAtomValue(overdriveHacksSonarRevealsAtom);
  const currentLength = currentGuessWord.length;

  // Memoize so the tile array reference stays stable across re-renders triggered
  // by the parent (e.g. Main re-rendering on a turn change); combined with
  // memo(GuessTile), unchanged tiles bail out of reconciliation instead of
  // recreating 5 new tile objects and re-running useSonarPing every time
  const currentGuessTiles = useMemo(
    () => buildCurrentGuessTiles(currentGuessWord, isInvalidGuess, sonarReveals),
    [currentGuessWord, isInvalidGuess, sonarReveals]
  );

  return (
    <div className={cn("grid grid-cols-5 grid-rows-1 gap-1", isInvalidGuess && "animate-pulse")}>
      {currentGuessTiles.map((tile, tileIndex) => (
        // Keys stay stable per position: the sonar ping is driven by the
        // `isSonarReveal` prop through useSonarPing's effect + cleanup, so
        // keying on it would remount the tile DOM on every reveal flip
        <CurrentGuessTile key={tileIndex} tile={tile} tileIndex={tileIndex} currentLength={currentLength} />
      ))}
    </div>
  );
}

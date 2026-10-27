// react
import { useMemo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { wordChallengeCurrentGuessWordAtom, wordChallengeIsRejectedAtom } from "@/features/game/state/word-challenge";
import { overdriveHacksSonarRevealsAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { sonarVowelByPosition } from "@/features/overdrive-hacks/domain/sonar";

// components
import { GuessTile } from "./guess-tile";

// types
import type { Tile } from "@/features/game/domain/models";

// constants
import { WORD_LENGTH } from "@/features/game/domain/constants";

// One row of current-guess tiles: typed letters first, then any sonar-revealed vowels, then the remaining empty positions
function buildCurrentGuessTiles(currentGuessWord: string, isInvalidGuess: boolean, vowelByPosition: ReadonlyMap<number, string>): Tile[] {
  return Array.from({ length: WORD_LENGTH }, (_, position): Tile => {
    const typedLetter = currentGuessWord[position];

    if (typedLetter !== undefined) {
      return { tileKey: typedLetter, color: isInvalidGuess ? "red" : "" };
    }

    const sonarVowel = vowelByPosition.get(position);
    return sonarVowel ? { tileKey: sonarVowel, color: "green" } : { tileKey: "", color: "" };
  });
}

export function CurrentGuess() {
  const isInvalidGuess = useAtomValue(wordChallengeIsRejectedAtom);
  const currentGuessWord = useAtomValue(wordChallengeCurrentGuessWordAtom);
  const sonarReveals = useAtomValue(overdriveHacksSonarRevealsAtom);

  // O(1) tile lookup: flatten reveal positions once instead of scanning per tile
  const vowelByPosition = useMemo(() => sonarVowelByPosition(sonarReveals), [sonarReveals]);
  const currentLength = currentGuessWord.length;
  const currentGuessTiles = buildCurrentGuessTiles(currentGuessWord, isInvalidGuess, vowelByPosition);

  return (
    <div className={cn("grid grid-cols-5 grid-rows-1 gap-1", isInvalidGuess && "animate-pulse")}>
      {currentGuessTiles.map((tile, tileIndex) => {
        const isSonarReveal = tileIndex >= currentLength && vowelByPosition.has(tileIndex);

        return (
          // Keys stay stable per position: the sonar ping is driven by the
          // `isSonarReveal` prop through useSonarPing's effect + cleanup, so
          // keying on it would remount the tile DOM on every reveal flip
          <GuessTile
            key={tileIndex}
            tile={tile}
            bounceAnim={tile.tileKey !== "" && tileIndex === currentLength - 1 && !isSonarReveal}
            isSonarReveal={isSonarReveal}
          />
        );
      })}
    </div>
  );
}

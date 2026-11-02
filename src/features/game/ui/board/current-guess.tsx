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

// A single current-guess tile; encapsulates the subtle per-tile index math so the row's map callback stays focused on layout:
// - Typed letters occupy indices < currentLength; sonar-revealed tiles occupy indices >= currentLength with a non-empty key
// - Only the most recently typed tile bounces (it can never also be a sonar reveal, since those sit at or past currentLength)
function CurrentGuessTile({ tile, tileIndex, currentLength }: { tile: Tile; tileIndex: number; currentLength: number }) {
  const isSonarReveal = tileIndex >= currentLength && tile.tileKey !== "";
  const isLastTypedTile = tile.tileKey !== "" && tileIndex === currentLength - 1;

  return <GuessTile tile={tile} bounceAnim={isLastTypedTile} isSonarReveal={isSonarReveal} />;
}

// `CurrentGuess` owns no props, so React would re-render it by default whenever
// `Main` re-renders (e.g. on a turn change). `memo` bails out at the component
// boundary instead, so the tile array below is only rebuilt when the atoms it
// actually subscribes to change — no `useMemo` needed to stabilize tile object
// references for `memo(GuessTile)`
export const CurrentGuess = memo(function CurrentGuess() {
  const isInvalidGuess = useAtomValue(wordChallengeIsRejectedAtom);
  const currentGuessWord = useAtomValue(wordChallengeCurrentGuessWordAtom);
  const sonarReveals = useAtomValue(overdriveHacksSonarRevealsAtom);
  const currentLength = currentGuessWord.length;

  const currentGuessTiles = buildCurrentGuessTiles(currentGuessWord, isInvalidGuess, sonarReveals);

  return (
    <div className={cn("grid grid-cols-5 grid-rows-1 gap-1", isInvalidGuess && "animate-pulse")}>
      {currentGuessTiles.map((tile, tileIndex) => (
        <CurrentGuessTile key={tileIndex} tile={tile} tileIndex={tileIndex} currentLength={currentLength} />
      ))}
    </div>
  );
});

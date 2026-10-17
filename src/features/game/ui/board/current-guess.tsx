// react
import { useEffect, useMemo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue, useAtomSet } from "@effect/atom-react";
import { wordChallengeCurrentGuessWordAtom, wordChallengeIsRejectedAtom } from "@/features/game/state/word-challenge";
import { overdriveHacksMachineAtom, overdriveHacksSonarRevealsAtom } from "@/features/overdrive-hacks/state";

// components
import { GuessTile } from "./guess-tile";

// types
import type { Color, Tile } from "@/features/game/domain/models";

// constants
import { WORD_LENGTH } from "@/features/game/domain/constants";

export function CurrentGuess() {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);
  const isInvalidGuess = useAtomValue(wordChallengeIsRejectedAtom);
  const currentGuessWord = useAtomValue(wordChallengeCurrentGuessWordAtom);
  const sonarReveals = useAtomValue(overdriveHacksSonarRevealsAtom);

  // O(1) tile lookup: flatten reveal positions once instead of scanning per tile
  const sonarVowelByPosition = useMemo(
    () => new Map(sonarReveals.flatMap((reveal) => reveal.positions.map((position) => [position, reveal.vowel] as const))),
    [sonarReveals]
  );

  // Single AbortController removes the keyup listener on unmount or re-run
  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener("keyup", (ev) => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey: ev.key }), { signal: controller.signal });

    return () => controller.abort();
  }, [overdriveHacksMachineEvent]);

  const currentLength = currentGuessWord.length;

  const finalGuessTiles: Tile[] = [
    ...currentGuessWord.split("").map<Tile>((tileKey) => ({ tileKey, color: (isInvalidGuess ? "red" : "") as Color })),
    ...Array.from({ length: WORD_LENGTH - currentLength }, (_, i) => {
      const position = currentLength + i;
      const vowel = sonarVowelByPosition.get(position);
      return vowel ? ({ tileKey: vowel, color: "green" } as const satisfies Tile) : ({ tileKey: "", color: "" } as const satisfies Tile);
    }),
  ];

  return (
    <div className={cn("grid grid-cols-5 grid-rows-1 gap-1", isInvalidGuess && "animate-pulse")}>
      {finalGuessTiles.map((tile, tileIndex) => {
        const isSonarReveal = tileIndex >= currentLength && sonarVowelByPosition.has(tileIndex);
        return (
          <GuessTile
            key={tileIndex + String(isSonarReveal)}
            tile={tile}
            bounceAnim={tile.tileKey !== "" && tileIndex === currentLength - 1 && !isSonarReveal}
            isSonarReveal={isSonarReveal}
          />
        );
      })}
    </div>
  );
}

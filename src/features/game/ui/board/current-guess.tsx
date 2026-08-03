// react
import { useEffect } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue, useAtomSet } from "@effect/atom-react";
import { wordChallengeCurrentGuessWordAtom, wordChallengeMachineAtom } from "@/features/game/state";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state";

// components
import { GuessTile } from "./guess-tile";

// types
import type { Color, Tile } from "@/features/game/domain";

// constants
import { WORD_LENGTH } from "@/features/game/domain";

export function CurrentGuess() {
  const overdriveHacksMachineEvent = useAtomSet(overdriveHacksMachineAtom);
  const wordChallengeMachineSnapshot = useAtomValue(wordChallengeMachineAtom);
  const currentGuessWord = useAtomValue(wordChallengeCurrentGuessWordAtom);

  // Single AbortController removes the keyup listener on unmount or re-run
  useEffect(() => {
    const controller = new AbortController();
    window.addEventListener("keyup", (ev) => overdriveHacksMachineEvent({ type: "input.keyPressed", pressedKey: ev.key }), { signal: controller.signal });

    return () => controller.abort();
  }, [overdriveHacksMachineEvent]);

  const isInvalidGuess = wordChallengeMachineSnapshot.matches("rejected");
  const currentLength = currentGuessWord.length;

  const finalGuessTiles: Tile[] = [
    ...currentGuessWord.split("").map<Tile>((tileKey) => ({ tileKey, color: (isInvalidGuess ? "red" : "") as Color })),
    ...Array.from({ length: WORD_LENGTH - currentLength }, () => ({ tileKey: "", color: "" as Color })),
  ];

  return (
    <div className={cn("grid grid-cols-5 grid-rows-1 gap-1", isInvalidGuess && "animate-pulse")}>
      {finalGuessTiles.map((tile, tileIndex) => (
        <GuessTile key={tileIndex} tile={tile} bounceAnim={tile.tileKey !== "" && tileIndex === currentLength - 1} />
      ))}
    </div>
  );
}

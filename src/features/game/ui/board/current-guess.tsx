// react
import { useEffect } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue, useAtom } from "@effect/atom-react";
import { parseKey } from "@/features/game/domain";
import { keypadColorsAtom, wordChallengeCurrentGuessWordAtom, wordChallengeMachineAtom } from "@/features/game/state";

// components
import { GuessTile } from "./guess-tile";

// types
import type { Color, Tile } from "@/features/game/domain";

export function CurrentGuess() {
  const [wordChallengeMachineSnapshot, wordChallengeMachineEvent] = useAtom(wordChallengeMachineAtom);
  const currentGuessWord = useAtomValue(wordChallengeCurrentGuessWordAtom);
  const keypadColors = useAtomValue(keypadColorsAtom);

  const isInvalidGuess = wordChallengeMachineSnapshot.matches("rejected");

  useEffect(() => {
    // Handle the keyboard input one key at a time
    function handleKeyUp(ev: KeyboardEvent) {
      // Map raw input to domain action and exit early if it is junk
      const gameAction = parseKey(ev.key, keypadColors);

      if (gameAction._tag === "AddLetter") wordChallengeMachineEvent({ type: "wordChallenge.letterPressed", letter: gameAction.letter });
      else if (gameAction._tag === "RemoveLetter") wordChallengeMachineEvent({ type: "wordChallenge.backspacePressed" });
      else if (gameAction._tag === "SubmitGuess") wordChallengeMachineEvent({ type: "wordChallenge.enterPressed" });
    }

    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keypadColors, wordChallengeMachineEvent]);

  const currentGuessTiles = [...currentGuessWord].map((tileKey) => ({ tileKey, color: (isInvalidGuess ? "red" : "") as Color }));
  const remainingEmptyTiles = Array<Tile>(5 - currentGuessTiles.length).fill({ tileKey: "", color: "" as Color });
  const finalGuessTiles = [...currentGuessTiles, ...remainingEmptyTiles];

  return (
    <div className={cn("grid grid-cols-5 grid-rows-1 gap-1", isInvalidGuess && "animate-pulse")}>
      {finalGuessTiles.map((tile, tileIndex) => (
        <GuessTile key={tileIndex} tile={tile} bounceAnim={tile.tileKey !== "" && tileIndex === currentGuessTiles.length - 1} />
      ))}
    </div>
  );
}

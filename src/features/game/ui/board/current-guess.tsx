// react
import { useEffect } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue, useAtomSet } from "@effect/atom-react";
import { currentGuessWordAtom, handleKeyAction, turnMachineAtom } from "@/features/game/state";

// components
import { GuessTile } from "./guess-tile";

// types
import type { Color, Tile } from "@/features/game/domain";

export function CurrentGuess() {
  const turnMachineSnapshot = useAtomValue(turnMachineAtom);
  const currentGuessWord = useAtomValue(currentGuessWordAtom);
  const handleKey = useAtomSet(handleKeyAction);

  const isInvalidGuess = turnMachineSnapshot.matches("rejected");

  useEffect(() => {
    // Handle the keyboard input one key at a time
    function handleKeyUp(ev: KeyboardEvent) {
      handleKey(ev.key);
    }

    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKey]);

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

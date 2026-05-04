// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { gameStateAtom, handleKeyAction } from "@/atoms/gameAtom";

// components
import GuessTile from "./GuessTile";

// types
import type { Color, Tile } from "@/domain/models";

export default function CurrentGuess() {
  const { currentGuessWord } = useAtomValue(gameStateAtom);
  const handleKey = useAtomSet(handleKeyAction);

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

  const currentGuessTiles = [...currentGuessWord].map((tileKey) => ({ tileKey, color: "" as Color }));
  const remainingEmptyTiles = Array<Tile>(5 - currentGuessTiles.length).fill({ tileKey: "", color: "" as Color });
  const finalGuessTiles = [...currentGuessTiles, ...remainingEmptyTiles];

  return (
    <div className="grid grid-cols-5 grid-rows-1 gap-4">
      {finalGuessTiles.map((tile, tileIndex) => (
        <GuessTile key={tileIndex} tile={tile} bounceAnim={tile.tileKey !== "" && tileIndex === currentGuessTiles.length - 1} />
      ))}
    </div>
  );
}

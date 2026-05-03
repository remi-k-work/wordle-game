// react
import { useEffect } from "react";

// services, features, and other libraries
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { gameStateAtom, handleKeyAction } from "@/atoms/gameAtom";

// components
import GuessTile from "./GuessTile";

export default function CurrentGuess() {
  const { currentGuessWord } = useAtomValue(gameStateAtom);
  const handleKey = useAtomSet(handleKeyAction);

  useEffect(() => {
    function handleKeyUp(ev: KeyboardEvent) {
      handleKey(ev.key);
    }

    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKey]);

  const tiles = [...currentGuessWord];
  const emptyTiles = Array(5 - tiles.length).fill("");
  const allTiles = [...tiles, ...emptyTiles];

  return (
    <div className="grid grid-cols-5 grid-rows-1 gap-4">
      {allTiles.map((tileKey, tileIndex) => (
        <GuessTile key={tileIndex} tileKey={tileKey} color="" bounceAnim={tileKey !== "" && tileIndex === tiles.length - 1} />
      ))}
    </div>
  );
}

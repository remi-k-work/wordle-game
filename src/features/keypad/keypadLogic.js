// game logic & slice
import { formatGuess } from "../game/gameLogic";

// To avoid storing a complex state object that is difficult to mutate, we store a simple one
// (an array of moves, for example) and derive more useful representations of state as needed
export function deriveUsedKeys(theSecretWord, wordleGuesses) {
  const usedKeys = {};

  for (const wordleGuess of wordleGuesses) {
    const formattedGuess = formatGuess(theSecretWord, wordleGuess);
    for (const guessTile of formattedGuess) {
      const currentColor = usedKeys[guessTile.tileKey];

      if (guessTile.color === "green") {
        usedKeys[guessTile.tileKey] = "green";
        continue;
      }

      if (guessTile.color === "yellow" && currentColor !== "green") {
        usedKeys[guessTile.tileKey] = "yellow";
        continue;
      }

      if (guessTile.color === "grey" && currentColor !== ("green" || "yellow")) {
        usedKeys[guessTile.tileKey] = "grey";
        continue;
      }
    }
  }

  return usedKeys;
}

// services, features, and other libraries
import { Atom } from "effect/unstable/reactivity";
import { gameDataMachineAtom } from "@/features/game/state/game-data";
import { gameFlowMachineAtom } from "@/features/game/state/game-flow";
import { wordChallengeMachineAtom } from "@/features/game/state/word-challenge";

// Which action the flow button should offer. Kept as a derived atom so the
// primitive result (a 4-value string) suppresses atom notifications —
// subscribing to the raw machine snapshots would re-render the button on
// every keystroke, since typing assigns new machine context every letter
export type GameFlowVariant = "skeleton" | "next" | "start" | "forfeit";

export const gameFlowVariantAtom = Atom.make((get): GameFlowVariant => {
  const wordChallengeMachineSnapshot = get(wordChallengeMachineAtom);
  const gameDataMachineSnapshot = get(gameDataMachineAtom);
  const gameFlowMachineSnapshot = get(gameFlowMachineAtom);

  if (
    wordChallengeMachineSnapshot.matches("awaitingGameData") ||
    gameDataMachineSnapshot.matches("loading") ||
    gameDataMachineSnapshot.matches("selectingWord") ||
    gameFlowMachineSnapshot.matches("starting")
  )
    return "skeleton";

  // "Next Word" (won a word, OR returning to an active run with no current puzzle)
  if (gameFlowMachineSnapshot.matches("betweenWords")) return "next";

  // "Start New Run" (lost, forfeited, or idle with no active run)
  if (gameFlowMachineSnapshot.matches("ready")) return "start";

  // "Forfeit Run" (default — puzzle in progress)
  return "forfeit";
});

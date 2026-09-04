// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { gameDataMachineAtom, gameFlowMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";

// types
type GameFlowVariant = "skeleton" | "next" | "start" | "forfeit";

export function useGameFlowVariant(): GameFlowVariant {
  const wordChallengeMachineSnapshot = useAtomValue(wordChallengeMachineAtom);
  const gameDataMachineSnapshot = useAtomValue(gameDataMachineAtom);
  const gameFlowMachineSnapshot = useAtomValue(gameFlowMachineAtom);

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
}

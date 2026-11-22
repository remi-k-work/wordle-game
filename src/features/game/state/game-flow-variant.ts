// services, features, and other libraries
import { Atom } from "effect/reactivity";
import { gameDataMachineAtom } from "@/features/game/state/game-data";
import { runSessionMachineAtom } from "@/features/game/state/run-session";
import { wordChallengeMachineAtom } from "@/features/game/state/word-challenge";

// Which action the flow button should offer; kept as a derived atom so the
// primitive result (a 4-value string) suppresses atom notifications —
// subscribing to the raw machine snapshots would re-render the button on
// every keystroke, since typing assigns new machine context every letter
// The run session is the authority for the run phase; the word challenge and
// game data only gate the "still loading" skeleton
export type GameFlowVariant = "skeleton" | "next" | "start" | "forfeit";

export const gameFlowVariantAtom = Atom.make((get): GameFlowVariant => {
  const runSessionMachineSnapshot = get(runSessionMachineAtom);
  const wordChallengeMachineSnapshot = get(wordChallengeMachineAtom);
  const gameDataMachineSnapshot = get(gameDataMachineAtom);

  // No word challenge can run until the dictionary and the first word exist
  if (
    wordChallengeMachineSnapshot.matches("awaitingGameData") ||
    gameDataMachineSnapshot.matches("loading") ||
    gameDataMachineSnapshot.matches("selectingWord") ||
    gameDataMachineSnapshot.matches("failure")
  )
    return "skeleton";

  // "Next Word" (won a word, OR returning to an active run with no current puzzle)
  if (runSessionMachineSnapshot.matches({ active: "betweenWords" })) return "next";

  // "Start New Run" (lost, forfeited, or idle with no active run)
  if (runSessionMachineSnapshot.matches("inactive")) return "start";

  // "Forfeit Run" (default — puzzle in progress)
  return "forfeit";
});

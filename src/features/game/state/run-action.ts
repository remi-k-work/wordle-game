// services, features, and other libraries
import { Match } from "effect";
import { Atom } from "effect/reactivity";
import { taggedState } from "@xstate/effect";
import { gameDataMachineAtom } from "@/features/game/state/game-data";
import { runSessionMachineAtom } from "@/features/game/state/run-session";
import { wordChallengeMachineAtom } from "@/features/game/state/word-challenge";

// Which action the flow button should offer; kept as a derived atom so the
// primitive result (a 4-value string) suppresses atom notifications —
// subscribing to the raw machine snapshots would re-render the button on
// every keystroke, since typing assigns new machine context every letter
// The run session is the authority for the run phase; the word challenge and
// game data only gate the "still loading" skeleton
export type RunAction = "skeleton" | "next" | "start" | "forfeit";

export const runActionAtom = Atom.make((get): RunAction => {
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

  // The run session is the authority for the run phase; `taggedState` turns its
  // state value into a discriminated union so every phase must be handled here.
  // `classifying` is the initial state (and the fallback snapshot before the
  // actor is ready), so it maps to the loading skeleton rather than Forfeit.
  // `valueTags` is exhaustive: adding a run-session state without a mapping is a
  // compile error, and so is mapping a state that no longer exists.
  return Match.valueTags(taggedState(runSessionMachineSnapshot), {
    classifying: (): RunAction => "skeleton",
    inactive: (): RunAction => "start",
    "active.betweenWords": (): RunAction => "next",
    "active.playing": (): RunAction => "forfeit",
  });
});

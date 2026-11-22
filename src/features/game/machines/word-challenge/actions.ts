// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/reactivity";
import { trackInvalidGuessSubmitted, trackValidGuessSubmitted, trackWordLost, trackWordWon } from "@/features/telemetry/state/actions";
import { runSessionMachineAtom, runSessionMachineSendAtom } from "@/features/game/state/run-session";

// types
import type { ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  // Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
  trackInvalidGuessSubmitted: () => trackInvalidGuessSubmitted(),

  // Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
  trackValidGuessSubmitted: ({ wordChallenge }) => trackValidGuessSubmitted(wordChallenge),

  // Track metrics related to the event of winning the game (stream 2 -> global_pulse)
  trackWordWon: ({ wordChallenge }) =>
    Atom.get(runSessionMachineAtom).pipe(Effect.flatMap(({ context: runSession }) => trackWordWon(runSession, wordChallenge))),

  // `wordScore` is guaranteed `Some` here (the `wordWon` entry patches it before
  // enqueuing), but the branch is total anyway: an impossible `None` resolves as
  // a no-op instead of a NoSuchElementError that has no recovery
  onWordWon: ({ wordChallenge }) =>
    Option.match(wordChallenge.wordScore, {
      onNone: () => Effect.void,
      onSome: (wordScore) => Atom.set(runSessionMachineSendAtom, { type: "wordWon", wordScore }),
    }),

  // Track metrics related to the event of losing the game (stream 2 -> global_pulse)
  trackWordLost: ({ wordChallenge }) =>
    Atom.get(runSessionMachineAtom).pipe(Effect.flatMap(({ context: runSession }) => trackWordLost(runSession, wordChallenge))),

  onWordLost: () => Atom.set(runSessionMachineSendAtom, { type: "wordLost" }),
};

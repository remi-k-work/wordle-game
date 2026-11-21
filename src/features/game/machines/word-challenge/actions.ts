// services, features, and other libraries
import { Effect, Option, Schema } from "effect";
import { Atom } from "effect/reactivity";
import { trackInvalidGuessSubmitted, trackValidGuessSubmitted, trackWordLost, trackWordWon } from "@/features/telemetry/state/actions";
import { gameFlowMachineSendAtom } from "@/features/game/state/game-flow";
import { runSessionMachineAtom } from "@/features/game/state/run-session";
import { WordChallenge } from "./models";

// types
import type { ActionImplementations } from "@/lib/machine-setup";

// The params schemas are the single source of truth for what each action is
// enqueued with; setup.ts wires them into `schemas.actions`
export const Actions = {
  trackInvalidGuessSubmitted: { params: Schema.Struct({}) },
  trackValidGuessSubmitted: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
  trackWordWon: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
  onWordWon: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
  trackWordLost: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
  onWordLost: { params: Schema.Struct({}) },
};

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
      onSome: (wordScore) => Atom.set(gameFlowMachineSendAtom, { type: "word.won", wordScore }),
    }),

  // Track metrics related to the event of losing the game (stream 2 -> global_pulse)
  trackWordLost: ({ wordChallenge }) =>
    Atom.get(runSessionMachineAtom).pipe(Effect.flatMap(({ context: runSession }) => trackWordLost(runSession, wordChallenge))),

  onWordLost: () => Atom.set(gameFlowMachineSendAtom, { type: "word.lost" }),
};

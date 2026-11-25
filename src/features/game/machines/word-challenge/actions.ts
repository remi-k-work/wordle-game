// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/reactivity";
import { TelemetryTracker } from "@/features/telemetry/services/telemetry-tracker";
import { telemetryAttributes } from "@/features/telemetry/state/telemetry-attributes";
import { runSessionMachineAtom, runSessionMachineSendAtom } from "@/features/game/state/run-session";

// types
import type { ActionArgs, ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  // Track metrics related to submitting an invalid guess (stream 2 -> global_pulse)
  trackInvalidGuessSubmitted: Effect.fnUntraced(function* () {
    const tracker = yield* TelemetryTracker;
    yield* tracker.trackInvalidGuessSubmitted(yield* telemetryAttributes());
  }),

  // Track metrics related to submitting a valid guess (stream 2 -> global_pulse)
  trackValidGuessSubmitted: Effect.fnUntraced(function* ({ wordChallenge }: ActionArgs<typeof Actions.trackValidGuessSubmitted.params>) {
    const tracker = yield* TelemetryTracker;
    yield* tracker.trackValidGuessSubmitted(yield* telemetryAttributes(), wordChallenge);
  }),

  // Track metrics related to the event of winning the game (stream 2 -> global_pulse)
  trackWordWon: Effect.fnUntraced(function* ({ wordChallenge }: ActionArgs<typeof Actions.trackWordWon.params>) {
    const { context: runSession } = yield* Atom.get(runSessionMachineAtom);
    const tracker = yield* TelemetryTracker;
    yield* tracker.trackWordWon(yield* telemetryAttributes(), runSession, wordChallenge);
  }),

  // `wordScore` is guaranteed `Some` here (the `wordWon` entry patches it before
  // enqueuing), but the branch is total anyway: an impossible `None` resolves as
  // a no-op instead of a NoSuchElementError that has no recovery
  onWordWon: ({ wordChallenge }) =>
    Option.match(wordChallenge.wordScore, {
      onNone: () => Effect.void,
      onSome: (wordScore) => Atom.set(runSessionMachineSendAtom, { type: "wordWon", wordScore }),
    }),

  // Track metrics related to the event of losing the game (stream 2 -> global_pulse)
  trackWordLost: Effect.fnUntraced(function* ({ wordChallenge }: ActionArgs<typeof Actions.trackWordLost.params>) {
    const { context: runSession } = yield* Atom.get(runSessionMachineAtom);
    const tracker = yield* TelemetryTracker;
    yield* tracker.trackWordLost(yield* telemetryAttributes(), runSession, wordChallenge);
  }),

  onWordLost: () => Atom.set(runSessionMachineSendAtom, { type: "wordLost" }),
};

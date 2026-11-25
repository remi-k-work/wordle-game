// services, features, and other libraries
import { DateTime, Effect, Option } from "effect";
import { Atom } from "effect/reactivity";
import { TelemetryTracker } from "@/features/telemetry/services/telemetry-tracker";
import { telemetryAttributes } from "@/features/telemetry/state/telemetry-attributes";
import { runResultAtom } from "@/features/game/state/run-session";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { highScoreMachineSendAtom } from "@/features/high-score/state/high-score";
import { endPuzzle, forfeitRun, requestNextWord } from "@/features/game/state/commands";

// types
import type { ActionArgs, ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  // The completed-run summary belongs to the result UI, not durable storage: clearing it is an atom write
  clearFinishedRun: () => Atom.set(runResultAtom, Option.none()),

  // Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
  trackStartedNewRun: Effect.fnUntraced(function* () {
    const tracker = yield* TelemetryTracker;
    yield* tracker.trackStartedNewRun(yield* telemetryAttributes());
  }),

  // Build the immutable completed-run summary; `runId` is present by invariant for any active run,
  // so the Option lift cannot fail in practice (its typed failure still rides the machine's error channel).
  // Explicit param type: unlike a plain arrow, the generator passed to
  // Effect.fnUntraced gets no contextual typing from the actions record
  saveFinishedRun: Effect.fnUntraced(function* ({ runSession, deathReason }: ActionArgs<typeof Actions.saveFinishedRun.params>) {
    const now = yield* DateTime.now;
    const runId = yield* Effect.fromOption(runSession.runId);
    const createdAt = Option.getOrElse(runSession.createdAt, () => now);
    yield* Atom.set(runResultAtom, Option.some({ runId, createdAt, finishedAt: now, runScore: runSession.runScore, streak: runSession.streak, deathReason }));
  }),

  // Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
  trackForfeitedRun: Effect.fnUntraced(function* ({ runSession, wordChallenge }: ActionArgs<typeof Actions.trackForfeitedRun.params>) {
    const tracker = yield* TelemetryTracker;
    yield* tracker.trackForfeitedRun(yield* telemetryAttributes(), runSession, wordChallenge);
  }),

  // Notify high score machine that a run has finished
  onRunFinished: Effect.fnUntraced(function* ({ runSession }: ActionArgs<typeof Actions.onRunFinished.params>) {
    const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
    yield* Atom.set(highScoreMachineSendAtom, { type: "runFinished", runScore: runSession.runScore, streak: runSession.streak, solutionsLanguage });
  }),

  // The cross-machine fan-outs live in state/commands, so the run session's own
  // action bodies stay limited to its telemetry, result, and high-score duties
  requestNextWord: () => requestNextWord,
  endPuzzle: () => endPuzzle,
  forfeitRun: () => forfeitRun,
};

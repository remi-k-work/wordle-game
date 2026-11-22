// services, features, and other libraries
import { DateTime, Effect, Option } from "effect";
import { Atom } from "effect/reactivity";
import { modalMachineSendAtom } from "@/state/modal";
import { trackForfeitedRun, trackStartedNewRun } from "@/features/telemetry/state/actions";
import { runResultAtom } from "@/features/game/state/run-session";
import { gameDataMachineSendAtom } from "@/features/game/state/game-data";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { highScoreMachineSendAtom } from "@/features/high-score/state/high-score";
import { overdriveHacksMachineSendAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";

// types
import type { ActionArgs, ActionImplementations } from "@/lib/machine-setup";
import type { Actions } from "./models";

export const actions: ActionImplementations<typeof Actions> = {
  // The completed-run summary belongs to the result UI, not durable storage: clearing it is an atom write
  clearFinishedRun: () => Atom.set(runResultAtom, Option.none()),

  // Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
  trackStartedNewRun: () => trackStartedNewRun(),

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
  trackForfeitedRun: ({ runSession, wordChallenge }) => trackForfeitedRun(runSession, wordChallenge),

  // Notify high score machine that a run has finished
  onRunFinished: Effect.fnUntraced(function* ({ runSession }: ActionArgs<typeof Actions.onRunFinished.params>) {
    const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
    yield* Atom.set(highScoreMachineSendAtom, { type: "runFinished", runScore: runSession.runScore, streak: runSession.streak, solutionsLanguage });
  }),

  // Start a brand-new run: close the modal and ask game-data for the first word
  startNewRun: () =>
    Effect.all([Atom.set(modalMachineSendAtom, { type: "closed" }), Atom.set(gameDataMachineSendAtom, { type: "nextWordRequested" })], { discard: true }),

  // Between words: close the modal and ask game-data for the next word
  requestNextWord: () =>
    Effect.all([Atom.set(modalMachineSendAtom, { type: "closed" }), Atom.set(gameDataMachineSendAtom, { type: "nextWordRequested" })], { discard: true }),

  // A word was won: stop the overdrive hacks and show the status modal
  bankWonWord: () =>
    Effect.all([Atom.set(overdriveHacksMachineSendAtom, { type: "puzzleEnded" }), Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" })], {
      discard: true,
    }),

  // The run died on guesses: stop the overdrive hacks and show the status modal
  finishLostRun: () =>
    Effect.all([Atom.set(overdriveHacksMachineSendAtom, { type: "puzzleEnded" }), Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" })], {
      discard: true,
    }),

  // Forfeit the active run: abandon the word challenge, stop the overdrive hacks, and show the status modal
  forfeitRun: () =>
    Effect.all(
      [
        Atom.set(wordChallengeMachineSendAtom, { type: "runForfeited" }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "puzzleEnded" }),
        Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" }),
      ],
      { discard: true }
    ),
};

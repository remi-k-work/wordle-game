// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assertEvent } from "xstate";
import { gameDataMachineAtom, runSessionMachineAtom, wordChallengeMachineAtom, wordMetaMachineAtom } from "@/features/game/state";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state";
import { modalMachineAtom } from "@/state";

// types
import type { SolutionsLanguage, WordChallenge, WordScore } from "@/features/game/domain";

export const gameFlowMachine = setup({
  types: {} as {
    context: { readonly hasActiveRun: boolean };
    input: { readonly hasActiveRun: boolean };
    events:
      | { readonly type: "run.startRequested" }
      | { readonly type: "word.nextRequested" }
      | { readonly type: "run.forfeitConfirmed"; readonly wordChallenge: WordChallenge }
      | { readonly type: "word.won"; readonly wordScore: WordScore }
      | { readonly type: "word.lost" }
      | { readonly type: "hack.chargeRequested"; readonly amount: WordScore["wordScore"] }
      | { readonly type: "language.changed"; readonly solutionsLanguage: SolutionsLanguage };
  },
  actions: {
    startRun: () =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          yield* Atom.set(modalMachineAtom, { type: "closed" });
          yield* Atom.set(runSessionMachineAtom, { type: "startedNewRun" });
          yield* Atom.set(gameDataMachineAtom, { type: "nextWordRequested" });
        })
      ),
    requestNextWord: () =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          yield* Atom.set(modalMachineAtom, { type: "closed" });
          yield* Atom.set(gameDataMachineAtom, { type: "nextWordRequested" });
        })
      ),
    forfeitRun: ({ event }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          assertEvent(event, "run.forfeitConfirmed");
          yield* Atom.set(runSessionMachineAtom, { type: "forfeitedRun", wordChallenge: event.wordChallenge });
          yield* Atom.set(wordChallengeMachineAtom, { type: "forfeitedRun" });
          yield* Atom.set(overdriveHacksMachineAtom, { type: "puzzle.ended" });
          yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
        })
      ),
    bankWonWord: ({ event }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          assertEvent(event, "word.won");
          yield* Atom.set(runSessionMachineAtom, { type: "wordWon", wordScore: event.wordScore });
          yield* Atom.set(overdriveHacksMachineAtom, { type: "puzzle.ended" });
          yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
        })
      ),
    finishLostRun: () =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          yield* Atom.set(runSessionMachineAtom, { type: "wordLost" });
          yield* Atom.set(overdriveHacksMachineAtom, { type: "puzzle.ended" });
          yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
        })
      ),
    changeLanguage: ({ event }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          assertEvent(event, "language.changed");
          yield* Atom.set(runSessionMachineAtom, { type: "solutionsLanguageChanged" });
          yield* Atom.set(wordChallengeMachineAtom, { type: "solutionsLanguageChanged" });
          yield* Atom.set(overdriveHacksMachineAtom, { type: "solutionsLanguageChanged" });
          yield* Atom.set(wordMetaMachineAtom, { type: "resetRequested" });
          yield* Atom.set(gameDataMachineAtom, { type: "solutionsLanguageChanged", solutionsLanguage: event.solutionsLanguage });
        })
      ),
    settleHackCharge: ({ event }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          assertEvent(event, "hack.chargeRequested");
          const runSession = (yield* Atom.get(runSessionMachineAtom)).context;
          const accepted = runSession.runId._tag === "Some" && runSession.runScore >= event.amount;
          if (accepted) yield* Atom.set(runSessionMachineAtom, { type: "runScoreSpent", amount: event.amount });
          yield* Atom.set(overdriveHacksMachineAtom, { type: accepted ? "charge.accepted" : "charge.rejected" });
        })
      ),
  },
}).createMachine({
  id: "gameFlow",
  context: ({ input }) => input,
  initial: "classifying",
  states: {
    classifying: {
      always: [{ guard: ({ context }) => context.hasActiveRun, target: "betweenWords" }, { target: "ready" }],
    },
    ready: {
      on: {
        "run.startRequested": { target: "starting", actions: "startRun" },
        "language.changed": { actions: "changeLanguage" },
      },
    },
    starting: {
      always: "playing",
      on: { "language.changed": { target: "ready", actions: "changeLanguage" } },
    },
    playing: {
      on: {
        "word.won": { target: "betweenWords", actions: "bankWonWord" },
        "word.lost": { target: "ready", actions: "finishLostRun" },
        "run.forfeitConfirmed": { target: "ready", actions: "forfeitRun" },
        "hack.chargeRequested": { actions: "settleHackCharge" },
        "language.changed": { target: "ready", actions: "changeLanguage" },
      },
    },
    betweenWords: {
      on: {
        "word.nextRequested": { target: "starting", actions: "requestNextWord" },
        "language.changed": { target: "ready", actions: "changeLanguage" },
      },
    },
  },
});

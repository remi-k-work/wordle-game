// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { runClientCommand } from "@/lib/runtime-client";
import { setup, assertEvent } from "xstate";
import { gameDataMachineAtom } from "@/features/game/state/game-data";
import { runSessionMachineAtom } from "@/features/game/state/run-session";
import { wordChallengeMachineAtom } from "@/features/game/state/word-challenge";
import { wordMetaMachineAtom } from "@/features/game/state/word-meta";
import { overdriveHacksMachineAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { modalMachineAtom } from "@/state/modal";

// types
import type { SolutionsLanguage, WordChallenge, WordScore } from "@/features/game/domain/models";

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
      | { readonly type: "language.changed"; readonly solutionsLanguage: SolutionsLanguage };
  },
  actions: {
    startRun: () =>
      runClientCommand(
        Effect.all([
          Atom.set(modalMachineAtom, { type: "closed" }),
          Atom.set(runSessionMachineAtom, { type: "startedNewRun" }),
          Atom.set(gameDataMachineAtom, { type: "nextWordRequested" }),
        ])
      ),
    requestNextWord: () =>
      runClientCommand(Effect.all([Atom.set(modalMachineAtom, { type: "closed" }), Atom.set(gameDataMachineAtom, { type: "nextWordRequested" })])),
    forfeitRun: ({ event }) =>
      runClientCommand(
        Effect.gen(function* () {
          assertEvent(event, "run.forfeitConfirmed");
          yield* Effect.all([
            Atom.set(runSessionMachineAtom, { type: "forfeitedRun", wordChallenge: event.wordChallenge }),
            Atom.set(wordChallengeMachineAtom, { type: "forfeitedRun" }),
            Atom.set(overdriveHacksMachineAtom, { type: "puzzle.ended" }),
            Atom.set(modalMachineAtom, { type: "opened", modalType: "status" }),
          ]);
        })
      ),
    bankWonWord: ({ event }) =>
      runClientCommand(
        Effect.gen(function* () {
          assertEvent(event, "word.won");
          yield* Effect.all([
            Atom.set(runSessionMachineAtom, { type: "wordWon", wordScore: event.wordScore }),
            Atom.set(overdriveHacksMachineAtom, { type: "puzzle.ended" }),
            Atom.set(modalMachineAtom, { type: "opened", modalType: "status" }),
          ]);
        })
      ),
    finishLostRun: () =>
      runClientCommand(
        Effect.all([
          Atom.set(runSessionMachineAtom, { type: "wordLost" }),
          Atom.set(overdriveHacksMachineAtom, { type: "puzzle.ended" }),
          Atom.set(modalMachineAtom, { type: "opened", modalType: "status" }),
        ])
      ),
    changeLanguage: ({ event }) =>
      runClientCommand(
        Effect.gen(function* () {
          assertEvent(event, "language.changed");
          yield* Effect.all([
            Atom.set(runSessionMachineAtom, { type: "solutionsLanguageChanged" }),
            Atom.set(wordChallengeMachineAtom, { type: "solutionsLanguageChanged" }),
            Atom.set(overdriveHacksMachineAtom, { type: "solutionsLanguageChanged" }),
            Atom.set(wordMetaMachineAtom, { type: "resetRequested" }),
            Atom.set(gameDataMachineAtom, { type: "solutionsLanguageChanged", solutionsLanguage: event.solutionsLanguage }),
          ]);
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

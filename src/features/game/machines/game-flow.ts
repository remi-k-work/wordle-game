// services, features, and other libraries
import { Effect, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { setupEffect } from "@xstate/effect";
import { assertEvent } from "xstate";
import { gameDataMachineSendAtom } from "@/features/game/state/game-data";
import { runSessionMachineSendAtom } from "@/features/game/state/run-session";
import { wordChallengeMachineSendAtom } from "@/features/game/state/word-challenge";
import { wordMetaMachineSendAtom } from "@/features/game/state/word-meta";
import { overdriveHacksMachineSendAtom } from "@/features/overdrive-hacks/state/overdrive-hacks";
import { modalMachineSendAtom } from "@/state/modal";
import { SolutionsLanguage, WordChallenge, WordScore } from "@/features/game/domain/models";

// The machine only ever carries one flag: whether a persisted run session was active when the flow started
const GameFlowContext = Schema.Struct({ hasActiveRun: Schema.Boolean });

export const gameFlowMachine = setupEffect({
  schemas: {
    context: GameFlowContext,

    // The flow is bootstrapped from the persisted run-session state; that flag is the createActor input
    input: GameFlowContext,
    events: {
      "run.startRequested": Schema.Struct({}),
      "word.nextRequested": Schema.Struct({}),
      "run.forfeitConfirmed": Schema.Struct({ wordChallenge: WordChallenge }),
      "word.won": Schema.Struct({ wordScore: WordScore }),
      "word.lost": Schema.Struct({}),
      "language.changed": Schema.Struct({ solutionsLanguage: SolutionsLanguage }),
    },
    actions: {
      startRun: { params: Schema.Struct({}) },
      requestNextWord: { params: Schema.Struct({}) },
      forfeitRun: { params: Schema.Struct({ wordChallenge: WordChallenge }) },
      bankWonWord: { params: Schema.Struct({ wordScore: WordScore }) },
      finishLostRun: { params: Schema.Struct({}) },
      changeLanguage: { params: Schema.Struct({ solutionsLanguage: SolutionsLanguage }) },
    },
  },
  actions: {
    // Start a brand-new run: close the modal, start the run session, pick the first word
    startRun: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Effect.all([
        Atom.set(modalMachineSendAtom, { type: "closed" }),
        Atom.set(runSessionMachineSendAtom, { type: "startedNewRun" }),
        Atom.set(gameDataMachineSendAtom, { type: "nextWordRequested" }),
      ], { discard: true }),

    // Between words: close the modal and ask game-data for the next word
    requestNextWord: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Effect.all([Atom.set(modalMachineSendAtom, { type: "closed" }), Atom.set(gameDataMachineSendAtom, { type: "nextWordRequested" })], { discard: true }),

    // Forfeit the active run: abandon the run session + word challenge, stop the overdrive hacks, and open the status modal
    forfeitRun: ({ wordChallenge }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Effect.all([
        Atom.set(runSessionMachineSendAtom, { type: "forfeitedRun", wordChallenge }),
        Atom.set(wordChallengeMachineSendAtom, { type: "forfeitedRun" }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "puzzle.ended" }),
        Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" }),
      ], { discard: true }),

    // Bank the won word into the run session, stop the hacks, show the status modal
    bankWonWord: ({ wordScore }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Effect.all([
        Atom.set(runSessionMachineSendAtom, { type: "wordWon", wordScore }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "puzzle.ended" }),
        Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" }),
      ], { discard: true }),

    // The run died on guesses: finish it, stop the hacks, show the status modal
    finishLostRun: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Effect.all([
        Atom.set(runSessionMachineSendAtom, { type: "wordLost" }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "puzzle.ended" }),
        Atom.set(modalMachineSendAtom, { type: "opened", modalType: "status" }),
      ], { discard: true }),

    // Language change abandons every in-flight feature machine and reloads the game data for the new language
    changeLanguage: ({ solutionsLanguage }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Effect.all([
        Atom.set(runSessionMachineSendAtom, { type: "solutionsLanguageChanged" }),
        Atom.set(wordChallengeMachineSendAtom, { type: "solutionsLanguageChanged" }),
        Atom.set(overdriveHacksMachineSendAtom, { type: "solutionsLanguageChanged" }),
        Atom.set(wordMetaMachineSendAtom, { type: "resetRequested" }),
        Atom.set(gameDataMachineSendAtom, { type: "solutionsLanguageChanged", solutionsLanguage }),
      ], { discard: true }),
  },
}).createMachine({
  id: "gameFlow",

  // Hydrate the flow from the persisted run session (a fresh object, never the input object itself)
  context: ({ input }) => ({ ...input }),
  initial: "classifying",

  states: {
    classifying: {
      always: (args) => {
        if (args.context.hasActiveRun) return { target: "betweenWords" };
        return { target: "ready" };
      },
    },

    // No active run: invite the player to start one
    ready: {
      on: {
        "run.startRequested": (args, enq) => {
          enq(args.actions.startRun, { self: args.self });
          return { target: "starting" };
        },

        // A language change keeps the current screen but resets every feature
        "language.changed": (args, enq) => {
          assertEvent(args.event, "language.changed");
          enq(args.actions.changeLanguage, { self: args.self, solutionsLanguage: args.event.solutionsLanguage });
        },
      },
    },

    // Transient: a new run was requested, move straight into play
    starting: {
      always: { target: "playing" },

      on: {
        "language.changed": (args, enq) => {
          assertEvent(args.event, "language.changed");
          enq(args.actions.changeLanguage, { self: args.self, solutionsLanguage: args.event.solutionsLanguage });
          return { target: "ready" };
        },
      },
    },

    // A run is being played
    playing: {
      on: {
        "word.won": (args, enq) => {
          assertEvent(args.event, "word.won");
          enq(args.actions.bankWonWord, { self: args.self, wordScore: args.event.wordScore });
          return { target: "betweenWords" };
        },

        "word.lost": (args, enq) => {
          enq(args.actions.finishLostRun, { self: args.self });
          return { target: "ready" };
        },

        "run.forfeitConfirmed": (args, enq) => {
          assertEvent(args.event, "run.forfeitConfirmed");
          enq(args.actions.forfeitRun, { self: args.self, wordChallenge: args.event.wordChallenge });
          return { target: "ready" };
        },

        "language.changed": (args, enq) => {
          assertEvent(args.event, "language.changed");
          enq(args.actions.changeLanguage, { self: args.self, solutionsLanguage: args.event.solutionsLanguage });
          return { target: "ready" };
        },
      },
    },

    // The run continues: wait for the player to ask for the next word
    betweenWords: {
      on: {
        "word.nextRequested": (args, enq) => {
          enq(args.actions.requestNextWord, { self: args.self });
          return { target: "starting" };
        },

        "language.changed": (args, enq) => {
          assertEvent(args.event, "language.changed");
          enq(args.actions.changeLanguage, { self: args.self, solutionsLanguage: args.event.solutionsLanguage });
          return { target: "ready" };
        },
      },
    },
  },
});

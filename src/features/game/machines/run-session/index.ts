// services, features, and other libraries
import { DateTime, Option } from "effect";
import { SecureRandom } from "effect/crypto";
import { assertEvent } from "xstate";
import { setup } from "./setup";
import { finishActiveRunContext } from "./helpers";

// types
import type { RunSession } from "./models";

// constants
import { INITIAL_RUN_SESSION } from "./constants";

// The run session owns the whole arcade lifecycle: it restores a persisted run,
// starts new ones, advances from word to word, and ends a run on a loss or
// forfeit; `active.playing` / `active.betweenWords` are the machine-level guard
// for the "Next Word" rule: `nextWordRequested` is only handled between words,
// so a request can never interrupt a word in progress
export const runSessionMachine = setup.createMachine({
  id: "runSession",

  // Hydrate the machine from the persisted KVS atom, falling back to the empty
  // session so the initial snapshot stays total even before input arrives
  context: ({ input }) => ({ ...INITIAL_RUN_SESSION(), ...input }) satisfies RunSession,
  initial: "classifying",

  states: {
    // Determine whether we are restoring an active run or starting from scratch
    classifying: {
      type: "choice",
      choice: (args) => (args.guards.hasActiveRun(args) ? { target: "#betweenWords" } : { target: "#inactive" }),
    },

    // No active run: invite the player to start one
    inactive: {
      id: "inactive",
      on: {
        // Start a brand-new arcade run; entering `active` lands on `playing`
        // because the first word is requested as part of starting
        newRunStarted: (args, enq) => {
          enq(args.actions.trackStartedNewRun, { self: args.self });
          enq(args.actions.clearFinishedRun, { self: args.self });
          enq(args.actions.requestNextWord, { self: args.self });
          return {
            target: "active",
            context: {
              ...INITIAL_RUN_SESSION(),
              // The sync context updater has no Effect context, so this uses the
              // `*Unsafe` primitive documented for exactly that case (it draws
              // from `globalThis.crypto`, like the `SecureRandom` service does)
              runId: Option.some(SecureRandom.uuidV4Unsafe()),
              createdAt: Option.some(DateTime.nowUnsafe()),
              bestRunScore: args.context.bestRunScore,
              bestStreak: args.context.bestStreak,
            },
          };
        },
      },
    },

    // A run is being played; the run can be forfeited at any point
    active: {
      initial: "playing",
      on: {
        // A language change abandons the active run
        solutionsLanguageChanged: (args, enq) => {
          enq(args.actions.clearFinishedRun, { self: args.self });
          return { target: "#inactive", context: finishActiveRunContext(args.context) };
        },

        // Forfeit the active run
        runForfeited: (args, enq) => {
          assertEvent(args.event, "runForfeited");
          enq(args.actions.trackForfeitedRun, { self: args.self, runSession: args.context, wordChallenge: args.event.wordChallenge });
          enq(args.actions.saveFinishedRun, { self: args.self, runSession: args.context, deathReason: "Forfeit" });
          enq(args.actions.onRunFinished, { self: args.self, runSession: args.context });
          enq(args.actions.forfeitRun, { self: args.self });
          return { target: "#inactive", context: finishActiveRunContext(args.context) };
        },

        // A completed hack charges the run wherever the run is active, including
        // the moment a word ends: overdrive is idle between words, so this cannot
        // admit a new purchase, only settle one already made
        runScoreSpent: (args) => {
          assertEvent(args.event, "runScoreSpent");
          return { context: { ...args.context, runScore: Math.max(0, args.context.runScore - args.event.amount) } };
        },
      },
      states: {
        // A word challenge is in flight (or its word is being picked)
        playing: {
          on: {
            // Word won, bank volatile points and wait between words
            wordWon: (args, enq) => {
              assertEvent(args.event, "wordWon");
              enq(args.actions.endPuzzle, { self: args.self });
              const runScore = args.context.runScore + args.event.wordScore.wordScore;
              const streak = args.context.streak + 1;
              return {
                target: "#betweenWords",
                context: {
                  ...args.context,
                  runScore,
                  streak,
                  bestRunScore: Math.max(args.context.bestRunScore, runScore),
                  bestStreak: Math.max(args.context.bestStreak, streak),
                },
              };
            },

            // Word lost, finish the active run (same shape as forfeit, without the forfeit telemetry)
            wordLost: (args, enq) => {
              enq(args.actions.endPuzzle, { self: args.self });
              enq(args.actions.saveFinishedRun, { self: args.self, runSession: args.context, deathReason: "Guesses" });
              enq(args.actions.onRunFinished, { self: args.self, runSession: args.context });
              return { target: "#inactive", context: finishActiveRunContext(args.context) };
            },
          },
        },

        // The run continues: wait for the player to ask for the next word
        betweenWords: {
          id: "betweenWords",
          on: {
            nextWordRequested: (args, enq) => {
              enq(args.actions.requestNextWord, { self: args.self });
              return { target: "playing" };
            },
          },
        },
      },
    },
  },
});

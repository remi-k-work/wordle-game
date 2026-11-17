// services, features, and other libraries
import { DateTime, Option } from "effect";
import { SecureRandom } from "effect/crypto";
import { assertEvent } from "xstate";
import { setup } from "./setup";

// types
import type { RunSession } from "./models";

// constants
import { INITIAL_RUN_SESSION } from "./constants";

const finishActiveRunContext = (context: RunSession) =>
  ({ ...INITIAL_RUN_SESSION, bestRunScore: context.bestRunScore, bestStreak: context.bestStreak }) as const satisfies RunSession;

export const runSessionMachine = setup.createMachine({
  id: "runSession",

  // Hydrate the machine with the input from the KVS Atom
  context: ({ input }) => ({ ...input }) satisfies RunSession,
  initial: "classifying",

  states: {
    // Determine whether we are restoring an active or completed run
    classifying: {
      always: (args) => (args.guards.hasActiveRun(args) ? { target: "active" } : { target: "inactive" }),
    },

    inactive: {
      on: {
        // Start a brand-new arcade run
        startedNewRun: (args, enq) => {
          enq(args.actions.trackStartedNewRun, { self: args.self });
          enq(args.actions.clearFinishedRun, { self: args.self });
          return {
            target: "active",
            context: {
              ...INITIAL_RUN_SESSION,
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

    active: {
      on: {
        // A language change abandons the active run
        solutionsLanguageChanged: (args, enq) => {
          enq(args.actions.clearFinishedRun, { self: args.self });
          return { target: "inactive", context: finishActiveRunContext(args.context) };
        },

        // Forfeit the active run
        forfeitedRun: (args, enq) => {
          assertEvent(args.event, "forfeitedRun");
          enq(args.actions.trackForfeitedRun, { self: args.self, runSession: args.context, wordChallenge: args.event.wordChallenge });
          enq(args.actions.saveFinishedRun, { self: args.self, runSession: args.context, deathReason: "Forfeit" });
          enq(args.actions.onRunFinished, { self: args.self, runSession: args.context });
          return { target: "inactive", context: finishActiveRunContext(args.context) };
        },

        // Word won, bank volatile points
        wordWon: (args) => {
          assertEvent(args.event, "wordWon");
          const runScore = args.context.runScore + args.event.wordScore.wordScore;
          const streak = args.context.streak + 1;
          return {
            context: {
              ...args.context,
              runScore,
              streak,
              bestRunScore: Math.max(args.context.bestRunScore, runScore),
              bestStreak: Math.max(args.context.bestStreak, streak),
            },
          };
        },

        runScoreSpent: (args) => {
          assertEvent(args.event, "runScoreSpent");
          return { context: { ...args.context, runScore: Math.max(0, args.context.runScore - args.event.amount) } };
        },

        // Word lost, finish the active run (same shape as forfeit, without the forfeit telemetry)
        wordLost: (args, enq) => {
          enq(args.actions.saveFinishedRun, { self: args.self, runSession: args.context, deathReason: "Guesses" });
          enq(args.actions.onRunFinished, { self: args.self, runSession: args.context });
          return { target: "inactive", context: finishActiveRunContext(args.context) };
        },
      },
    },
  },
});

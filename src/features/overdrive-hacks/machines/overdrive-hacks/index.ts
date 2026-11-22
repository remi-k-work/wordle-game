// services, features, and other libraries
import { Array, Option } from "effect";
import { setup } from "./setup";
import { shouldForwardKeyPress } from "./helpers";

// constants
import { INITIAL_OVERDRIVE_HACKS } from "./constants";

export const overdriveHacksMachine = setup.createMachine({
  id: "overdriveHacks",
  context: INITIAL_OVERDRIVE_HACKS(),
  initial: "idle",

  on: {
    solutionsLanguageChanged: { target: ".idle", context: () => INITIAL_OVERDRIVE_HACKS() },
    puzzleStarted: { target: ".active" },
    puzzleEnded: { target: ".idle", context: () => INITIAL_OVERDRIVE_HACKS() },
  },

  states: {
    idle: {},

    // An active puzzle is running — hacks and keypress forwarding are live
    active: {
      initial: "ready",

      // Physical key presses are forwarded to the word challenge from every
      // state of an active puzzle, so the forwarding lives here once instead of
      // once per applying state
      on: {
        keyPressed: (args, enq) => {
          if (shouldForwardKeyPress(args.context.empNukedLetters, args.event.pressedKey)) {
            enq(args.actions.forwardKeyPress, { self: args.self, pressedKey: args.event.pressedKey });
          }
        },
      },

      states: {
        // No hack in flight: a new hack may be requested
        ready: {
          on: {
            hackRequested: { target: "classifying" },
          },
        },

        // Determine which hack specifically needs to be applied; the fallback
        // returns to `ready` so an unrecognized request can't strand the machine
        classifying: {
          type: "choice",
          choice: (args) => {
            if (args.guards.isEmpHackRequested(args)) return { target: "applyingEmpHack" };
            if (args.guards.isSonarHackRequested(args)) return { target: "applyingSonarHack" };
            if (args.guards.isOverrideHackRequested(args)) return { target: "applyingOverrideHack" };
            return { target: "ready" };
          },
        },

        applyingEmpHack: {
          invoke: {
            src: "applyEmpHackActor",
            input: ({ context }) => ({ empNukedLetters: context.empNukedLetters }),
            onDone: (args) => ({
              target: "ready",
              context: { empNukedLetters: Array.appendAll(args.context.empNukedLetters, Option.getOrElse(args.output, Array.empty)) },
            }),
            onError: (args, enq) => {
              enq(args.actions.logHackFailure, { self: args.self, hackId: "emp", error: args.event.error });
              return { target: "ready" };
            },
          },
        },

        applyingSonarHack: {
          invoke: {
            src: "applySonarHackActor",
            input: ({ context }) => ({ sonarReveals: context.sonarReveals }),
            onDone: (args) => ({
              target: "ready",
              context: { sonarReveals: Array.appendAll(args.context.sonarReveals, Option.toArray(args.output)) },
            }),
            onError: (args, enq) => {
              enq(args.actions.logHackFailure, { self: args.self, hackId: "sonar", error: args.event.error });
              return { target: "ready" };
            },
          },
        },

        applyingOverrideHack: {
          invoke: {
            src: "applyOverrideHackActor",
            onDone: (args, enq) => {
              enq(args.actions.onOverrideHackApplied, { self: args.self });
              return { target: "fetchingOverrideAudio", context: { theOverride: args.output } };
            },
            onError: (args, enq) => {
              enq(args.actions.onOverrideHackApplied, { self: args.self });
              enq(args.actions.logHackFailure, { self: args.self, hackId: "override", error: args.event.error });
              return { target: "ready" };
            },
          },
        },

        fetchingOverrideAudio: {
          invoke: {
            src: "fetchOverrideAudioActor",
            input: ({ context }) => ({ theOverride: context.theOverride }),
            onDone: (args) => ({ target: "ready", context: { theOverrideAudio: args.output } }),

            // Audio is a non-critical enrichment; even if the actor itself fails unexpectedly, the game remains playable
            onError: (args, enq) => {
              enq(args.actions.logHackFailure, { self: args.self, hackId: "override audio", error: args.event.error });
              return { target: "ready" };
            },
          },
        },
      },
    },
  },
});

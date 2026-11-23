// services, features, and other libraries
import { Array, Option } from "effect";
import { setup } from "./setup";

// constants
import { INITIAL_OVERDRIVE_HACKS } from "./constants";

export const overdriveHacksMachine = setup.createMachine({
  id: "overdriveHacks",
  context: INITIAL_OVERDRIVE_HACKS(),
  initial: "idle",

  on: {
    // A new language (or a puzzle ending) clears the block list: the letters
    // nuked in the previous puzzle must not filter keys in the next one
    solutionsLanguageChanged: (args, enq) => {
      enq(args.actions.syncBlockedLetters, { self: args.self, blockedLetters: [] });
      return { target: ".idle", context: INITIAL_OVERDRIVE_HACKS() };
    },
    puzzleStarted: { target: ".active" },
    puzzleEnded: (args, enq) => {
      enq(args.actions.syncBlockedLetters, { self: args.self, blockedLetters: [] });
      return { target: ".idle", context: INITIAL_OVERDRIVE_HACKS() };
    },
  },

  states: {
    idle: {},

    // An active puzzle is running — hacks are live
    active: {
      initial: "ready",

      states: {
        // No hack in flight: a new hack may be requested
        ready: {
          on: {
            // Only an affordable request may start a hack; returning undefined
            // leaves the event unhandled and the machine in `ready`
            hackRequested: (args) => {
              if (args.guards.canAffordHack(args)) return { target: "classifying" };
              return;
            },
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
            onDone: (args, enq) => {
              const empNukedLetters = Array.appendAll(args.context.empNukedLetters, Option.getOrElse(args.output, Array.empty));
              enq(args.actions.syncBlockedLetters, { self: args.self, blockedLetters: empNukedLetters });
              if (Option.isSome(args.output)) enq(args.actions.chargeHack, { self: args.self, overdriveHackId: "emp" });
              return { target: "ready", context: { empNukedLetters } };
            },
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
            onDone: (args, enq) => {
              if (Option.isSome(args.output)) enq(args.actions.chargeHack, { self: args.self, overdriveHackId: "sonar" });
              return { target: "ready", context: { sonarReveals: Array.appendAll(args.context.sonarReveals, Option.toArray(args.output)) } };
            },
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
              if (Option.isSome(args.output)) enq(args.actions.chargeHack, { self: args.self, overdriveHackId: "override" });
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

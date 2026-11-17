// services, features, and other libraries
import { Array, Effect, Option, Schema } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";
import { createEffectLogic, setupEffect } from "@xstate/effect";
import { assertEvent } from "xstate";
import { RpcOverdriveHacksClient } from "@/features/overdrive-hacks/rpc/client";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { gameDataKeypadAtom } from "@/features/game/state/game-data";
import { runSessionMachineSendAtom } from "@/features/game/state/run-session";
import { wordChallengeMachineSendAtom, wordChallengeTheSecretWordAtom, wordChallengeWordleGuessesAtom } from "@/features/game/state/word-challenge";
import { wordMetaTheRiddleAtom, wordMetaWordDefinitionAtom } from "@/features/game/state/word-meta";
import { overdriveHacksCanApplyHackAtom } from "@/features/overdrive-hacks/state/can-apply";
import { calculateEmpTargets } from "@/features/overdrive-hacks/domain/emp";
import { calculateSonarTarget } from "@/features/overdrive-hacks/domain/sonar";
import { modalMachineSendAtom } from "@/state/modal";
import { OverdriveHackId, OverdriveHacks } from "@/features/overdrive-hacks/domain/models";

// types
import type { EffectSourceArgs } from "@xstate/effect";

interface ApplyEmpHackInput {
  empNukedLetters: OverdriveHacks["empNukedLetters"];
}

interface ApplySonarHackInput {
  sonarReveals: OverdriveHacks["sonarReveals"];
}

interface FetchOverrideAudioInput {
  theOverride: OverdriveHacks["theOverride"];
}

// constants
import { initialOverdriveHacks, VOWELS_BY_LANGUAGE, OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain/constants";

// A hack actor that cannot read its inputs fails with this instead of a bare
// NoSuchElementError: the machine's onError branch logs it as a diagnosable
// failure rather than an anonymous defect
class HackInputUnavailable extends Schema.TaggedError<HackInputUnavailable, { readonly brand: unique symbol }>()("HackInputUnavailable", {
  input: Schema.Literals(["theSecretWord", "keypad"]),
}) {}

// The shared overdrive-hack purchase preamble: check affordability, produce the
// hack's result, and charge the run score only when a result was produced
const withHackPurchase = <A, E, R>(hackId: OverdriveHackId, produce: Effect.Effect<Option.Option<A>, E, R>) =>
  Atom.get(overdriveHacksCanApplyHackAtom(hackId)).pipe(
    Effect.flatMap((canApplyHack) => (canApplyHack ? produce : Effect.succeedNone)),
    Effect.tap((result) =>
      Option.isSome(result) ? Atom.set(runSessionMachineSendAtom, { type: "runScoreSpent", amount: OVERDRIVE_HACK_COST(hackId) }) : Effect.void
    )
  );

const applyEmpHackActor = createEffectLogic(({ input: { empNukedLetters } }: EffectSourceArgs<ApplyEmpHackInput>) =>
  withHackPurchase(
    "emp",
    Effect.gen(function* () {
      const theSecretWord = yield* Effect.fromOption(
        yield* Atom.get(wordChallengeTheSecretWordAtom),
        () => new HackInputUnavailable({ input: "theSecretWord" })
      );
      const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
      const keypad = yield* Effect.fromOption(yield* Atom.get(gameDataKeypadAtom), () => new HackInputUnavailable({ input: "keypad" }));

      return yield* calculateEmpTargets(theSecretWord, wordleGuesses, keypad, empNukedLetters);
    })
  )
);

const applySonarHackActor = createEffectLogic(({ input: { sonarReveals } }: EffectSourceArgs<ApplySonarHackInput>) =>
  withHackPurchase(
    "sonar",
    Effect.gen(function* () {
      const theSecretWord = yield* Effect.fromOption(
        yield* Atom.get(wordChallengeTheSecretWordAtom),
        () => new HackInputUnavailable({ input: "theSecretWord" })
      );
      const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

      return yield* calculateSonarTarget(
        theSecretWord,
        wordleGuesses,
        VOWELS_BY_LANGUAGE[solutionsLanguage],
        sonarReveals.map((reveal) => reveal.vowel)
      );
    })
  )
);

const applyOverrideHackActor = createEffectLogic(() =>
  withHackPurchase(
    "override",
    Effect.gen(function* () {
      const theSecretWord = yield* Effect.fromOption(
        yield* Atom.get(wordChallengeTheSecretWordAtom),
        () => new HackInputUnavailable({ input: "theSecretWord" })
      );
      const wordDefinition = yield* Atom.get(wordMetaWordDefinitionAtom);
      const theRiddle = yield* Atom.get(wordMetaTheRiddleAtom);
      const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

      const { fetchOverride } = yield* RpcOverdriveHacksClient;
      return yield* fetchOverride({ theSecretWord, wordDefinition, theRiddle, wordleGuesses, solutionsLanguage });
    })
  )
);

const fetchOverrideAudioActor = createEffectLogic(({ input: { theOverride } }: EffectSourceArgs<FetchOverrideAudioInput>) =>
  Effect.gen(function* () {
    const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

    const { fetchOverrideAudio } = yield* RpcOverdriveHacksClient;
    return yield* Option.match(theOverride, {
      onNone: () => Effect.succeedNone,
      onSome: (override) => fetchOverrideAudio({ input: override, solutionsLanguage }),
    });
  })
);

// EMP-nuked keys never reach the word-challenge machine
const shouldForwardKeyPress = (empNukedLetters: OverdriveHacks["empNukedLetters"], pressedKey: string) =>
  !Array.contains(empNukedLetters, pressedKey.toUpperCase());

export const overdriveHacksMachine = setupEffect({
  schemas: {
    context: OverdriveHacks,
    events: {
      solutionsLanguageChanged: Schema.Struct({}),
      "puzzle.started": Schema.Struct({}),
      "puzzle.ended": Schema.Struct({}),
      "input.keyPressed": Schema.Struct({ pressedKey: Schema.String }),
      "hack.useRequested": Schema.Struct({ overdriveHackId: OverdriveHackId }),
    },
    actions: {
      forwardKeyPress: { params: Schema.Struct({ pressedKey: Schema.String }) },
      onOverrideHackApplied: { params: Schema.Struct({}) },
      logHackFailure: { params: Schema.Struct({ hackId: Schema.String, error: Schema.Unknown }) },
    },
  },
  guards: {
    isEmpHackRequested: ({ event }) => {
      assertEvent(event, "hack.useRequested");
      return event.overdriveHackId === "emp";
    },
    isSonarHackRequested: ({ event }) => {
      assertEvent(event, "hack.useRequested");
      return event.overdriveHackId === "sonar";
    },
    isOverrideHackRequested: ({ event }) => {
      assertEvent(event, "hack.useRequested");
      return event.overdriveHackId === "override";
    },
  },
  actors: { applyEmpHackActor, applySonarHackActor, applyOverrideHackActor, fetchOverrideAudioActor },
  actions: {
    forwardKeyPress: ({ pressedKey }): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.set(wordChallengeMachineSendAtom, { type: "keyPressed", pressedKey }),

    // A failed override still opens the modal, which has its own "unavailable" state
    onOverrideHackApplied: (): Effect.Effect<void, never, AtomRegistry.AtomRegistry> =>
      Atom.set(modalMachineSendAtom, { type: "opened", modalType: "override-hack" }),

    logHackFailure: ({ hackId, error }) => Effect.logError(`[OVERDRIVE HACK FAILED]: ${hackId}`, error),
  },
}).createMachine({
  id: "overdriveHacks",
  context: initialOverdriveHacks(),
  initial: "idle",

  on: {
    solutionsLanguageChanged: { target: ".idle", context: () => initialOverdriveHacks() },
    "puzzle.started": { target: ".active" },
    "puzzle.ended": { target: ".idle", context: () => initialOverdriveHacks() },
  },

  states: {
    idle: {},

    // An active puzzle is running — hacks and keypress forwarding are live
    active: {
      on: {
        "input.keyPressed": (args, enq) => {
          if (shouldForwardKeyPress(args.context.empNukedLetters, args.event.pressedKey)) {
            enq(args.actions.forwardKeyPress, { self: args.self, pressedKey: args.event.pressedKey });
          }
        },
        "hack.useRequested": { target: "classifying" },
      },
    },

    // Determine which hack specifically needs to be applied
    classifying: {
      always: (args) => {
        if (args.guards.isEmpHackRequested(args)) return { target: "applyingEmpHack" };
        if (args.guards.isSonarHackRequested(args)) return { target: "applyingSonarHack" };
        if (args.guards.isOverrideHackRequested(args)) return { target: "applyingOverrideHack" };
      },
    },

    applyingEmpHack: {
      on: {
        "input.keyPressed": (args, enq) => {
          if (shouldForwardKeyPress(args.context.empNukedLetters, args.event.pressedKey)) {
            enq(args.actions.forwardKeyPress, { self: args.self, pressedKey: args.event.pressedKey });
          }
        },
      },

      invoke: {
        src: "applyEmpHackActor",
        input: ({ context }) => ({ empNukedLetters: context.empNukedLetters }),
        onDone: (args) => ({
          target: "active",
          context: { empNukedLetters: Array.appendAll(args.context.empNukedLetters, Option.getOrElse(args.output, Array.empty)) },
        }),
        onError: (args, enq) => {
          enq(args.actions.logHackFailure, { self: args.self, hackId: "emp", error: args.event.error });
          return { target: "active" };
        },
      },
    },

    applyingSonarHack: {
      on: {
        "input.keyPressed": (args, enq) => {
          if (shouldForwardKeyPress(args.context.empNukedLetters, args.event.pressedKey)) {
            enq(args.actions.forwardKeyPress, { self: args.self, pressedKey: args.event.pressedKey });
          }
        },
      },

      invoke: {
        src: "applySonarHackActor",
        input: ({ context }) => ({ sonarReveals: context.sonarReveals }),
        onDone: (args) => ({
          target: "active",
          context: { sonarReveals: [...args.context.sonarReveals, ...Option.toArray(args.output)] },
        }),
        onError: (args, enq) => {
          enq(args.actions.logHackFailure, { self: args.self, hackId: "sonar", error: args.event.error });
          return { target: "active" };
        },
      },
    },

    applyingOverrideHack: {
      on: {
        "input.keyPressed": (args, enq) => {
          if (shouldForwardKeyPress(args.context.empNukedLetters, args.event.pressedKey)) {
            enq(args.actions.forwardKeyPress, { self: args.self, pressedKey: args.event.pressedKey });
          }
        },
      },

      invoke: {
        src: "applyOverrideHackActor",
        onDone: (args, enq) => {
          enq(args.actions.onOverrideHackApplied, { self: args.self });
          return { target: "fetchingOverrideAudio", context: { theOverride: args.output } };
        },
        onError: (args, enq) => {
          enq(args.actions.onOverrideHackApplied, { self: args.self });
          enq(args.actions.logHackFailure, { self: args.self, hackId: "override", error: args.event.error });
          return { target: "active" };
        },
      },
    },

    fetchingOverrideAudio: {
      on: {
        "input.keyPressed": (args, enq) => {
          if (shouldForwardKeyPress(args.context.empNukedLetters, args.event.pressedKey)) {
            enq(args.actions.forwardKeyPress, { self: args.self, pressedKey: args.event.pressedKey });
          }
        },
      },

      invoke: {
        src: "fetchOverrideAudioActor",
        input: ({ context }) => ({ theOverride: context.theOverride }),
        onDone: (args) => ({ target: "active", context: { theOverrideAudio: args.output } }),

        // Audio is a non-critical enrichment; even if the actor itself fails unexpectedly, the game remains playable
        onError: (args, enq) => {
          enq(args.actions.logHackFailure, { self: args.self, hackId: "override audio", error: args.event.error });
          return { target: "active" };
        },
      },
    },
  },
});

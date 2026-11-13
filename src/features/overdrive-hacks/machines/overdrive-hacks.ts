// services, features, and other libraries
import { Array, Effect, Option, Schema } from "effect";
import { Atom } from "effect/reactivity";
import { runClientCommand } from "@/lib/runtime-client";
import { effectActor } from "@/lib/effect-actor";
import { RpcOverdriveHacksClient } from "@/features/overdrive-hacks/rpc/client";
import { setup, assign, assertEvent } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state/game-settings";
import { gameDataKeypadAtom } from "@/features/game/state/game-data";
import { runSessionMachineAtom } from "@/features/game/state/run-session";
import { wordChallengeMachineAtom, wordChallengeTheSecretWordAtom, wordChallengeWordleGuessesAtom } from "@/features/game/state/word-challenge";
import { wordMetaTheRiddleAtom, wordMetaWordDefinitionAtom } from "@/features/game/state/word-meta";
import { overdriveHacksCanApplyHackAtom } from "@/features/overdrive-hacks/state/can-apply";
import { calculateEmpTargets } from "@/features/overdrive-hacks/domain/emp";
import { calculateSonarTarget } from "@/features/overdrive-hacks/domain/sonar";
import { modalMachineAtom } from "@/state/modal";

// types
import type { OverdriveHackId, OverdriveHacks, SonarReveal } from "@/features/overdrive-hacks/domain/models";

// A hack actor that cannot read its inputs fails with this instead of a bare
// NoSuchElementError: the machine's onError branch logs it as a diagnosable
// failure rather than an anonymous defect
class HackInputUnavailable extends Schema.TaggedError<HackInputUnavailable, { readonly brand: unique symbol }>()("HackInputUnavailable", {
  input: Schema.Literals(["theSecretWord", "keypad"]),
}) {}

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

// The shared overdrive-hack purchase preamble: check affordability, produce the
// hack's result, and charge the run score only when a result was produced.
// Every hack runs through this one gate so the affordability check and the
// charge cannot drift apart between the three actors
const withHackPurchase = <A, E, R>(hackId: OverdriveHackId, produce: Effect.Effect<Option.Option<A>, E, R>) =>
  Atom.get(overdriveHacksCanApplyHackAtom(hackId)).pipe(
    Effect.flatMap((canApplyHack) => (canApplyHack ? produce : Effect.succeedNone)),
    Effect.tap((result) =>
      Option.isSome(result) ? Atom.set(runSessionMachineAtom, { type: "runScoreSpent", amount: OVERDRIVE_HACK_COST(hackId) }) : Effect.void
    )
  );

// One shared onError action for every hack: the hack id is the only difference
// between the four branches below, so it is a factory argument rather than four
// hand-written closures that can drift. The id stays inside the message (not a
// structured field) so the log line a developer greps for does not change
const logHackFailure =
  (hackId: string) =>
  ({ event }: { readonly event: { readonly error: unknown } }) => {
    void runClientCommand(Effect.logError(`[OVERDRIVE HACK FAILED]: ${hackId}`, event.error));
  };

const applyEmpHackActor = effectActor(({ empNukedLetters }: ApplyEmpHackInput) =>
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

const applySonarHackActor = effectActor(({ sonarReveals }: ApplySonarHackInput) =>
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

const applyOverrideHackActor = effectActor(() =>
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

const fetchOverrideAudioActor = effectActor(({ theOverride }: FetchOverrideAudioInput) =>
  Effect.gen(function* () {
    const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

    const { fetchOverrideAudio } = yield* RpcOverdriveHacksClient;
    return yield* Option.match(theOverride, {
      onNone: () => Effect.succeedNone,
      onSome: (override) => fetchOverrideAudio({ input: override, solutionsLanguage }),
    });
  })
);

export const overdriveHacksMachine = setup({
  types: {} as {
    context: OverdriveHacks;
    events:
      | { readonly type: "solutionsLanguageChanged" }
      | { readonly type: "puzzle.started" }
      | { readonly type: "puzzle.ended" }
      | { readonly type: "input.keyPressed"; readonly pressedKey: string }
      | { readonly type: "hack.useRequested"; readonly overdriveHackId: OverdriveHackId }
      // The invoked actors' done events, declared so onDone can read `event.output`
      // through assertEvent — the hand-annotated `params` they replace needed a
      // type-suppression comment per action, which silently disabled every type
      // error on the statement
      | { readonly type: "xstate.done.actor.applyEmpHackActor"; readonly output: Option.Option<OverdriveHacks["empNukedLetters"]> }
      | { readonly type: "xstate.done.actor.applySonarHackActor"; readonly output: Option.Option<SonarReveal> }
      | { readonly type: "xstate.done.actor.applyOverrideHackActor"; readonly output: OverdriveHacks["theOverride"] }
      | { readonly type: "xstate.done.actor.fetchOverrideAudioActor"; readonly output: OverdriveHacks["theOverrideAudio"] }
      // The invoked actors' error events, declared so onError can log the failure
      // (see the onError branches below) instead of discarding it silently
      | { readonly type: "xstate.error.actor.applyEmpHackActor"; readonly error: unknown }
      | { readonly type: "xstate.error.actor.applySonarHackActor"; readonly error: unknown }
      | { readonly type: "xstate.error.actor.applyOverrideHackActor"; readonly error: unknown }
      | { readonly type: "xstate.error.actor.fetchOverrideAudioActor"; readonly error: unknown };
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
  actions: {
    applyEmpHack: assign(({ context, event }) => {
      assertEvent(event, "xstate.done.actor.applyEmpHackActor");
      // `getOrElse(() => [])`, not `Option.toArray`: this actor's Option already
      // wraps the nuked-letter array, so `toArray` would nest it one level deeper
      // (see `applySonarHack` below, whose Option wraps a single reveal)
      const empNukedLetters = event.output.pipe(Option.getOrElse(() => []));
      return { ...context, empNukedLetters: [...context.empNukedLetters, ...empNukedLetters] } satisfies OverdriveHacks;
    }),

    applySonarHack: assign(({ context, event }) => {
      assertEvent(event, "xstate.done.actor.applySonarHackActor");
      const sonarReveals = event.output.pipe(Option.toArray);
      return { ...context, sonarReveals: [...context.sonarReveals, ...sonarReveals] } satisfies OverdriveHacks;
    }),

    applyOverrideHack: assign(({ context, event }) => {
      assertEvent(event, "xstate.done.actor.applyOverrideHackActor");
      return { ...context, theOverride: event.output } satisfies OverdriveHacks;
    }),

    onOverrideHackApplied: () => runClientCommand(Atom.set(modalMachineAtom, { type: "opened", modalType: "override-hack" })),

    saveOverrideAudio: assign(({ context, event }) => {
      assertEvent(event, "xstate.done.actor.fetchOverrideAudioActor");
      return { ...context, theOverrideAudio: event.output } satisfies OverdriveHacks;
    }),

    // Filter EMP-nuked keys before forwarding keypresses to the word-challenge machine
    forwardKeyPress: ({ context, event }) => {
      assertEvent(event, "input.keyPressed");
      const normalizedKey = event.pressedKey.toUpperCase();
      // A linear membership test over the handful of nuked letters (the same
      // `Array.contains` spelling validators.canSubmitGuess uses for the guess
      // history); word-challenge's greyLetters keeps a HashSet because the same
      // per-keypress lookup there runs over a far larger key set
      if (Array.contains(context.empNukedLetters, normalizedKey)) return;

      void runClientCommand(Atom.set(wordChallengeMachineAtom, { type: "keyPressed", pressedKey: event.pressedKey }));
    },
  },
  actors: { applyEmpHackActor, applySonarHackActor, applyOverrideHackActor, fetchOverrideAudioActor },
}).createMachine({
  id: "overdriveHacks",
  context: initialOverdriveHacks(),
  initial: "idle",

  on: {
    solutionsLanguageChanged: { target: ".idle", actions: assign(initialOverdriveHacks) },
    "puzzle.started": { target: ".active" },
    "puzzle.ended": { target: ".idle", actions: assign(initialOverdriveHacks) },
  },

  states: {
    idle: {},

    // An active puzzle is running — hacks and keypress forwarding are live
    active: {
      on: {
        "input.keyPressed": { actions: "forwardKeyPress" },
        "hack.useRequested": { target: "classifying" },
      },
    },

    // Determine which hack specifically needs to be applied
    classifying: {
      always: [
        { guard: "isEmpHackRequested", target: "applyingEmpHack" },
        { guard: "isSonarHackRequested", target: "applyingSonarHack" },
        { guard: "isOverrideHackRequested", target: "applyingOverrideHack" },
      ],
    },

    applyingEmpHack: {
      on: { "input.keyPressed": { actions: "forwardKeyPress" } },

      invoke: {
        src: "applyEmpHackActor",
        input: ({ context }) => ({ empNukedLetters: context.empNukedLetters }),
        onDone: { target: "active", actions: "applyEmpHack" },

        // The hack failed (missing inputs, a rejected RPC): the machine returns
        // to `active` — the player can retry or play on — but the failure is
        // logged through the client runtime instead of dying silently with the
        // actor
        onError: { target: "active", actions: logHackFailure("emp") },
      },
    },

    applyingSonarHack: {
      on: { "input.keyPressed": { actions: "forwardKeyPress" } },

      invoke: {
        src: "applySonarHackActor",
        input: ({ context }) => ({ sonarReveals: context.sonarReveals }),
        onDone: { target: "active", actions: "applySonarHack" },
        onError: { target: "active", actions: logHackFailure("sonar") },
      },
    },

    applyingOverrideHack: {
      on: { "input.keyPressed": { actions: "forwardKeyPress" } },

      invoke: {
        src: "applyOverrideHackActor",
        onDone: { target: "fetchingOverrideAudio", actions: ["applyOverrideHack", "onOverrideHackApplied"] },
        // A failed override still opens the modal, which has its own
        // "unavailable" state — the failure is logged like every other hack
        onError: { target: "active", actions: ["onOverrideHackApplied", logHackFailure("override")] },
      },
    },

    fetchingOverrideAudio: {
      on: { "input.keyPressed": { actions: "forwardKeyPress" } },

      invoke: {
        src: "fetchOverrideAudioActor",

        input: ({ context }) => ({ theOverride: context.theOverride }),
        onDone: { target: "active", actions: "saveOverrideAudio" },

        // Audio is a non-critical enrichment; even if the actor itself fails unexpectedly, the game remains playable
        onError: { target: "active", actions: logHackFailure("override audio") },
      },
    },
  },
});

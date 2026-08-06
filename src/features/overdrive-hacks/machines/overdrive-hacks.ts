// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { RpcOverdriveHacksClient } from "@/features/overdrive-hacks/rpc/client";
import { setup, assign, fromPromise, assertEvent } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";
import {
  gameDataKeypadAtom,
  runSessionMachineAtom,
  wordChallengeMachineAtom,
  wordChallengeTheSecretWordAtom,
  wordChallengeWordleGuessesAtom,
} from "@/features/game/state";
import { overdriveHacksCanApplyHackAtom } from "@/features/overdrive-hacks/state";
import { calculateEmpTargets, calculateSonarTarget } from "@/features/overdrive-hacks/domain";
import { modalMachineAtom } from "@/state";

// types
import type { OverdriveHackId, OverdriveHacks } from "@/features/overdrive-hacks/domain";

interface ApplyEmpHackActorArgs {
  input: { readonly empNukedLetters: OverdriveHacks["empNukedLetters"] };
  signal: AbortSignal;
}

interface ApplySonarHackActorArgs {
  input: { readonly sonarReveals: OverdriveHacks["sonarReveals"] };
  signal: AbortSignal;
}

// constants
import { INITIAL_OVERDRIVE_HACKS, VOWELS_BY_LANGUAGE, OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain";

const applyEmpHackActor = fromPromise(async ({ input, signal }: ApplyEmpHackActorArgs) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      // Determines whether a specific overdrive hack can be used (the player must be able to afford it and the game must be running)
      const canApplyHack = yield* Atom.get(overdriveHacksCanApplyHackAtom("emp"));
      if (!canApplyHack) return Option.none();

      const theSecretWord = Option.getOrThrow(yield* Atom.get(wordChallengeTheSecretWordAtom));
      const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
      const keypad = Option.getOrThrow(yield* Atom.get(gameDataKeypadAtom));

      const empTargets = yield* calculateEmpTargets(theSecretWord, wordleGuesses, keypad, input.empNukedLetters);

      // Charge the player's run score for the hack, if applicable
      if (Option.isSome(empTargets)) yield* Atom.set(runSessionMachineAtom, { type: "runScoreSpent", amount: OVERDRIVE_HACK_COST("emp") });

      return empTargets;
    }),
    { signal }
  )
);

const applySonarHackActor = fromPromise(async ({ input, signal }: ApplySonarHackActorArgs) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      // Determines whether a specific overdrive hack can be used (the player must be able to afford it and the game must be running)
      const canApplyHack = yield* Atom.get(overdriveHacksCanApplyHackAtom("sonar"));
      if (!canApplyHack) return Option.none();

      const theSecretWord = Option.getOrThrow(yield* Atom.get(wordChallengeTheSecretWordAtom));
      const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

      const sonarTarget = yield* calculateSonarTarget(
        theSecretWord,
        wordleGuesses,
        VOWELS_BY_LANGUAGE[solutionsLanguage],
        input.sonarReveals.map((reveal) => reveal.vowel)
      );

      // Charge the player's run score for the hack, if applicable
      if (Option.isSome(sonarTarget)) yield* Atom.set(runSessionMachineAtom, { type: "runScoreSpent", amount: OVERDRIVE_HACK_COST("sonar") });

      return sonarTarget;
    }),
    { signal }
  )
);

const applyOverrideHackActor = fromPromise(async ({ signal }: { signal: AbortSignal }) =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      // Determines whether a specific overdrive hack can be used (the player must be able to afford it and the game must be running)
      const canApplyHack = yield* Atom.get(overdriveHacksCanApplyHackAtom("override"));
      if (!canApplyHack) return Option.none();

      const theSecretWord = Option.getOrThrow(yield* Atom.get(wordChallengeTheSecretWordAtom));
      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);

      const { fetchOverride } = yield* RpcOverdriveHacksClient;
      const theOverride = yield* fetchOverride({ theSecretWord, solutionsLanguage });

      // Charge the player's run score for the hack, if applicable
      if (theOverride) yield* Atom.set(runSessionMachineAtom, { type: "runScoreSpent", amount: OVERDRIVE_HACK_COST("override") });

      return Option.some(theOverride);
    }),
    { signal }
  )
);

export const overdriveHacksMachine = setup({
  types: {} as {
    context: OverdriveHacks;
    events:
      | { readonly type: "solutionsLanguageChanged" }
      | { readonly type: "puzzle.started" }
      | { readonly type: "puzzle.ended" }
      | { readonly type: "input.keyPressed"; readonly pressedKey: string }
      | { readonly type: "hack.useRequested"; readonly overdriveHackId: OverdriveHackId };
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
    applyEmpHack: assign(
      ({ context }, params: { empNukedLetters: OverdriveHacks["empNukedLetters"] }) =>
        ({ ...context, empNukedLetters: [...context.empNukedLetters, ...params.empNukedLetters] }) as const satisfies OverdriveHacks
    ),

    applySonarHack: assign(
      ({ context }, params: { sonarReveals: OverdriveHacks["sonarReveals"] }) =>
        ({ ...context, sonarReveals: [...context.sonarReveals, ...params.sonarReveals] }) as const satisfies OverdriveHacks
    ),

    applyOverrideHack: assign(
      ({ context }, params: { theOverride: OverdriveHacks["theOverride"] }) =>
        ({ ...context, theOverride: params.theOverride }) as const satisfies OverdriveHacks
    ),

    onOverrideHackApplied: () => RuntimeClient.runPromise(Atom.set(modalMachineAtom, { type: "opened", modalType: "override-hack" })),

    // Filter EMP-nuked keys before forwarding keypresses to the word-challenge machine
    forwardKeyPress: ({ context, event }) => {
      assertEvent(event, "input.keyPressed");
      const normalizedKey = event.pressedKey.toUpperCase();
      if (context.empNukedLetters.includes(normalizedKey)) return;

      RuntimeClient.runPromise(Atom.set(wordChallengeMachineAtom, { type: "keyPressed", pressedKey: event.pressedKey }));
    },
  },
  actors: { applyEmpHackActor, applySonarHackActor, applyOverrideHackActor },
}).createMachine({
  id: "overdriveHacks",
  context: INITIAL_OVERDRIVE_HACKS,
  initial: "idle",

  on: {
    solutionsLanguageChanged: { target: ".idle", actions: assign(() => INITIAL_OVERDRIVE_HACKS) },
    "puzzle.started": { target: ".active" },
    "puzzle.ended": { target: ".idle", actions: assign(() => INITIAL_OVERDRIVE_HACKS) },
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
        onDone: {
          target: "active",
          actions: { type: "applyEmpHack", params: ({ event }) => ({ empNukedLetters: event.output.pipe(Option.getOrElse(() => [])) }) },
        },
        onError: { target: "active" },
      },
    },

    applyingSonarHack: {
      on: { "input.keyPressed": { actions: "forwardKeyPress" } },

      invoke: {
        src: "applySonarHackActor",
        input: ({ context }) => ({ sonarReveals: context.sonarReveals }),
        onDone: {
          target: "active",
          actions: { type: "applySonarHack", params: ({ event }) => ({ sonarReveals: event.output.pipe(Option.toArray) }) },
        },
        onError: { target: "active" },
      },
    },

    applyingOverrideHack: {
      on: { "input.keyPressed": { actions: "forwardKeyPress" } },

      invoke: {
        src: "applyOverrideHackActor",
        onDone: {
          target: "active",
          actions: [{ type: "applyOverrideHack", params: ({ event }) => ({ theOverride: event.output }) }, "onOverrideHackApplied"],
        },
        onError: { target: "active", actions: "onOverrideHackApplied" },
      },
    },
  },
});

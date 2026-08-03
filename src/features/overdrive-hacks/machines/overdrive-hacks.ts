// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { assign, fromPromise, setup } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";
import { gameFlowMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";
import { calculateEmpTargets, calculateSonarTarget } from "@/features/overdrive-hacks/domain";

// types
import type { Keypad, TheSecretWord } from "@/features/game/domain";
import type { OverdriveHackEffect, OverdriveHackId, OverdriveHacks } from "@/features/overdrive-hacks/domain";

// constants
import { INITIAL_OVERDRIVE_HACKS, OVERDRIVE_HACK_COST, VOWELS_BY_LANGUAGE } from "@/features/overdrive-hacks/domain";

type ResolveInput = {
  readonly hackId: OverdriveHackId;
  readonly theSecretWord: TheSecretWord;
  readonly keypad: Keypad;
  readonly empNukedLetters: OverdriveHacks["empNukedLetters"];
  readonly sonarReveals: OverdriveHacks["sonarReveals"];
};

const resolveHackActor = fromPromise(async ({ input, signal }: { input: ResolveInput; signal: AbortSignal }): Promise<Option.Option<OverdriveHackEffect>> =>
  RuntimeClient.runPromise(
    Effect.gen(function* () {
      const wordChallenge = (yield* Atom.get(wordChallengeMachineAtom)).context;
      if (input.hackId === "emp") {
        return yield* calculateEmpTargets(input.theSecretWord, wordChallenge.wordleGuesses, input.keypad, input.empNukedLetters).pipe(
          Effect.map((result) => Option.map(result, (letters) => ({ _tag: "EmpApplied" as const, letters })))
        );
      }

      const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
      return yield* calculateSonarTarget(
        input.theSecretWord,
        wordChallenge.wordleGuesses,
        VOWELS_BY_LANGUAGE[solutionsLanguage],
        input.sonarReveals.map((reveal) => reveal.vowel)
      ).pipe(Effect.map((result) => Option.map(result, (reveal) => ({ _tag: "SonarApplied" as const, ...reveal }))));
    }),
    { signal }
  )
);

export const overdriveHacksMachine = setup({
  types: {} as {
    context: OverdriveHacks;
    events:
      | { readonly type: "gameDataLoaded"; readonly keypad: OverdriveHacks["keypad"] }
      | { readonly type: "puzzle.started"; readonly theSecretWord: TheSecretWord }
      | { readonly type: "puzzle.ended" }
      | { readonly type: "solutionsLanguageChanged" }
      | { readonly type: "input.keyPressed"; readonly pressedKey: string }
      | { readonly type: "hack.useRequested"; readonly hackId: OverdriveHackId }
      | { readonly type: "charge.accepted"; readonly requestId: string }
      | { readonly type: "charge.rejected"; readonly requestId: string }
      | { readonly type: "xstate.done.actor.resolveHack"; readonly output: Option.Option<OverdriveHackEffect> };
  },
  guards: {
    isCurrentCharge: ({ context, event }) =>
      (event.type === "charge.accepted" || event.type === "charge.rejected") &&
      Option.isSome(context.pendingRequestId) &&
      context.pendingRequestId.value === event.requestId,
  },
  actions: {
    saveGameData: assign(({ event }) => (event.type === "gameDataLoaded" ? { ...INITIAL_OVERDRIVE_HACKS, keypad: event.keypad } : INITIAL_OVERDRIVE_HACKS)),
    startPuzzle: assign(({ context, event }) =>
      event.type === "puzzle.started" ? { ...INITIAL_OVERDRIVE_HACKS, keypad: context.keypad, theSecretWord: Option.some(event.theSecretWord) } : context
    ),
    requestHack: assign(({ context, event }) =>
      event.type === "hack.useRequested" ? { ...context, pendingRequestId: Option.some(crypto.randomUUID()) } : context
    ),
    savePendingEffect: assign(({ context, event }) => {
      if (event.type !== "xstate.done.actor.resolveHack") return context;
      return Option.match(event.output, {
        onNone: () => ({ ...context, pendingRequestId: Option.none() }),
        onSome: (effect) => ({ ...context, pendingEffect: Option.some(effect) }),
      });
    }),
    clearPendingRequest: assign(({ context }) => ({ ...context, pendingEffect: Option.none(), pendingRequestId: Option.none() })),
    applyPendingEffect: assign(({ context }) =>
      Option.match(context.pendingEffect, {
        onNone: () => ({ ...context, pendingRequestId: Option.none() }),
        onSome: (effect) => {
          const applied =
            effect._tag === "EmpApplied"
              ? { ...context, empNukedLetters: [...context.empNukedLetters, ...effect.letters] }
              : { ...context, sonarReveals: [...context.sonarReveals, { vowel: effect.vowel, positions: effect.positions }] };
          return { ...applied, pendingEffect: Option.none(), pendingRequestId: Option.none() };
        },
      })
    ),
    requestCharge: ({ context, event }) => {
      if (event.type !== "xstate.done.actor.resolveHack" || Option.isNone(event.output) || Option.isNone(context.pendingRequestId)) return;
      const effect = event.output.value;
      const hackId: OverdriveHackId = effect._tag === "EmpApplied" ? "emp" : "sonar";
      RuntimeClient.runPromise(
        Atom.set(gameFlowMachineAtom, {
          type: "hack.chargeRequested",
          requestId: context.pendingRequestId.value,
          hackId,
          cost: OVERDRIVE_HACK_COST(hackId),
        })
      );
    },
    forwardKeyPress: ({ context, event }) => {
      if (event.type !== "input.keyPressed") return;
      const key = event.pressedKey.toUpperCase();
      if (context.empNukedLetters.includes(key)) return;
      RuntimeClient.runPromise(Atom.set(wordChallengeMachineAtom, { type: "keyPressed", pressedKey: event.pressedKey }));
    },
  },
  actors: { resolveHack: resolveHackActor },
}).createMachine({
  id: "overdriveHacks",
  context: INITIAL_OVERDRIVE_HACKS,
  initial: "awaitingGameData",
  on: {
    solutionsLanguageChanged: { target: ".awaitingGameData", actions: assign(() => INITIAL_OVERDRIVE_HACKS) },
    gameDataLoaded: { target: ".idle", actions: "saveGameData" },
    "puzzle.started": { guard: ({ context }) => Option.isSome(context.keypad), target: ".active", actions: "startPuzzle" },
    "puzzle.ended": { target: ".idle", actions: "clearPendingRequest" },
  },
  states: {
    awaitingGameData: {},
    idle: {},
    active: {
      on: {
        "input.keyPressed": { actions: "forwardKeyPress" },
        "hack.useRequested": { target: "resolving", actions: "requestHack" },
      },
    },
    resolving: {
      on: { "input.keyPressed": { actions: "forwardKeyPress" } },
      invoke: {
        id: "resolveHack",
        src: "resolveHack",
        input: ({ context, event }) => {
          if (event.type !== "hack.useRequested" || Option.isNone(context.theSecretWord) || Option.isNone(context.keypad)) {
            throw new Error("Overdrive hack resolution started without an active puzzle");
          }
          return {
            hackId: event.hackId,
            theSecretWord: context.theSecretWord.value,
            keypad: context.keypad.value,
            empNukedLetters: context.empNukedLetters,
            sonarReveals: context.sonarReveals,
          };
        },
        onDone: [
          { guard: ({ event }) => Option.isNone(event.output), target: "active", actions: "clearPendingRequest" },
          { target: "charging", actions: ["savePendingEffect", "requestCharge"] },
        ],
        onError: { target: "active", actions: "clearPendingRequest" },
      },
    },
    charging: {
      on: {
        "input.keyPressed": { actions: "forwardKeyPress" },
        "charge.accepted": { guard: "isCurrentCharge", target: "active", actions: "applyPendingEffect" },
        "charge.rejected": { guard: "isCurrentCharge", target: "active", actions: "clearPendingRequest" },
      },
    },
  },
});

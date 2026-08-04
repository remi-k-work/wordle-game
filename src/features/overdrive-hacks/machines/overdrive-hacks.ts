// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assign, fromPromise, assertEvent } from "xstate";
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

// Resolves the selected hack into a concrete effect (nuked letters or a vowel reveal).
// Returns Option.none() when no valid targets remain (e.g. all vowels already revealed).
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

// ── State machine ──────────────────────────────────────────────────────────────
//
// Flow: awaitingGameData → idle → active{ resolving → charging → (back to active) }
//
// "active"            — puzzle in progress; hacks can be requested and keypresses forwarded.
// "active.resolving"  — hack target computation is running (e.g. shuffling candidates).
// "active.charging"   — awaiting score-deduction approval from the game-flow machine
//                       before applying the effect to context.
//
// The charging gate prevents applying effects without sufficient score.
// Late charge replies are dropped by XState once the machine leaves the charging state,
// so no explicit correlation ID needs to be tracked.
// ───────────────────────────────────────────────────────────────────────────────

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
      // Charge replies from game-flow; requestId is kept for game-flow's bookkeeping but not verified here
      | { readonly type: "charge.accepted" }
      | { readonly type: "charge.rejected" }
      | { readonly type: "xstate.done.actor.resolveHack"; readonly output: Option.Option<OverdriveHackEffect> };
  },
  actions: {
    // On gameDataLoaded: reset all hack state but preserve the incoming keypad layout
    saveGameData: assign(({ event }) => {
      assertEvent(event, "gameDataLoaded");
      return { ...INITIAL_OVERDRIVE_HACKS, keypad: event.keypad };
    }),

    // Puzzle start: reset context but carry forward the keypad we already have
    startPuzzle: assign(({ context, event }) => {
      assertEvent(event, "puzzle.started");
      return { ...INITIAL_OVERDRIVE_HACKS, keypad: context.keypad, theSecretWord: Option.some(event.theSecretWord) };
    }),

    // Save the resolved effect to context for the charging state to apply once the score is settled
    savePendingEffect: assign(({ context, event }) => {
      assertEvent(event, "xstate.done.actor.resolveHack");
      return Option.match(event.output, {
        onNone: () => context,
        onSome: (effect) => ({ ...context, pendingEffect: Option.some(effect) }),
      });
    }),

    // Drop the pending effect (charge rejected or puzzle ended)
    clearPendingEffect: assign(({ context }) => ({ ...context, pendingEffect: Option.none() })),

    // Charge accepted: merge the pending effect into permanent hack state
    applyPendingEffect: assign(({ context }) =>
      Option.match(context.pendingEffect, {
        onNone: () => context,
        onSome: (effect) => {
          const applied =
            effect._tag === "EmpApplied"
              ? { ...context, empNukedLetters: [...context.empNukedLetters, ...effect.letters] }
              : { ...context, sonarReveals: [...context.sonarReveals, { vowel: effect.vowel, positions: effect.positions }] };
          return { ...applied, pendingEffect: Option.none() };
        },
      })
    ),

    // Send the resolved effect to game-flow so it can charge the player's score
    requestCharge: ({ event }) => {
      assertEvent(event, "xstate.done.actor.resolveHack");
      if (Option.isNone(event.output)) return;
      const effect = event.output.value;
      // Reverse-map the effect tag back to the hack ID for game-flow's cost lookup
      const hackId: OverdriveHackId = effect._tag === "EmpApplied" ? "emp" : "sonar";
      RuntimeClient.runPromise(Atom.set(gameFlowMachineAtom, { type: "hack.chargeRequested", amount: OVERDRIVE_HACK_COST(hackId) }));
    },

    // Filter EMP-nuked keys before forwarding keypresses to the word-challenge machine
    forwardKeyPress: ({ context, event }) => {
      assertEvent(event, "input.keyPressed");
      const key = event.pressedKey.toUpperCase();
      // Don't forward discarded EMP'd letters
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
    "puzzle.started": { target: ".active", actions: "startPuzzle" },
    "puzzle.ended": { target: ".idle", actions: "clearPendingEffect" },
  },
  states: {
    // No game data yet; waits for keypad layout from the game-data machine
    awaitingGameData: {},
    idle: {},
    // Parent state for any puzzle-in-progress mode: hacks can be requested and keypresses forwarded
    active: {
      initial: "ready",
      on: {
        // Hoisted here so it applies during all substates (ready, resolving, charging)
        "input.keyPressed": { actions: "forwardKeyPress" },
        "hack.useRequested": { target: ".resolving" },
      },
      states: {
        // Puzzle in progress, no hack in flight yet
        ready: {},
        // Compute hack targets; on success move to charging to settle score
        resolving: {
          invoke: {
            id: "resolveHack",
            src: "resolveHack",
            input: ({ context, event }) => {
              assertEvent(event, "hack.useRequested");
              if (Option.isNone(context.theSecretWord) || Option.isNone(context.keypad)) {
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
            // First branch: no eligible targets → drop and return to active (no score change)
            // Second branch: targets found → save the effect and ask game-flow to charge the player's score
            onDone: [
              { guard: ({ event }) => Option.isNone(event.output), target: "#overdriveHacks.active.ready" },
              { target: "#overdriveHacks.active.charging", actions: ["savePendingEffect", "requestCharge"] },
            ],
            onError: { target: "#overdriveHacks.active.ready" },
          },
        },
        // Wait for game-flow's verdict on the score charge
        charging: {
          on: {
            // input.keyPressed handled by the parent active state
            // Score was accepted → apply the hack effect
            "charge.accepted": { target: "#overdriveHacks.active.ready", actions: "applyPendingEffect" },
            // Not enough score → discard the pending effect and go back
            "charge.rejected": { target: "#overdriveHacks.active.ready", actions: "clearPendingEffect" },
          },
        },
      },
    },
  },
});

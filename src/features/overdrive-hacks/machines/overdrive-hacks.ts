// services, features, and other libraries
import { Effect, Match, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assign, fromPromise, assertEvent } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";
import {
  gameDataKeypadAtom,
  gameFlowMachineAtom,
  wordChallengeMachineAtom,
  wordChallengeTheSecretWordAtom,
  wordChallengeWordleGuessesAtom,
} from "@/features/game/state";
import { calculateEmpTargets, calculateSonarTarget } from "@/features/overdrive-hacks/domain";

// types
import type { OverdriveHackEffect, OverdriveHackId, OverdriveHacks } from "@/features/overdrive-hacks/domain";

type ResolveHackActorInput = {
  readonly overdriveHackId: OverdriveHackId;
  readonly empNukedLetters: OverdriveHacks["empNukedLetters"];
  readonly sonarReveals: OverdriveHacks["sonarReveals"];
};

// constants
import { INITIAL_OVERDRIVE_HACKS, VOWELS_BY_LANGUAGE } from "@/features/overdrive-hacks/domain";

// Resolves the selected hack into a concrete effect (nuked letters or a vowel reveal).
// Returns Option.none() when no valid targets remain (e.g. all vowels already revealed).
const resolveHackActor = fromPromise(
  async ({ input, signal }: { input: ResolveHackActorInput; signal: AbortSignal }): Promise<Option.Option<OverdriveHackEffect>> =>
    RuntimeClient.runPromise(
      Effect.gen(function* () {
        const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
        const theSecretWord = Option.getOrThrow(yield* Atom.get(wordChallengeTheSecretWordAtom));
        const wordleGuesses = yield* Atom.get(wordChallengeWordleGuessesAtom);
        const keypad = Option.getOrThrow(yield* Atom.get(gameDataKeypadAtom));

        if (input.overdriveHackId === "emp") {
          return yield* calculateEmpTargets(theSecretWord, wordleGuesses, keypad, input.empNukedLetters).pipe(
            Effect.map((result) => Option.map(result, (letters) => ({ _tag: "EmpApplied" as const, letters })))
          );
        }

        return yield* calculateSonarTarget(
          theSecretWord,
          wordleGuesses,
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
      | { readonly type: "solutionsLanguageChanged" }
      | { readonly type: "puzzle.started" }
      | { readonly type: "puzzle.ended" }
      | { readonly type: "input.keyPressed"; readonly pressedKey: string }
      | { readonly type: "hack.useRequested"; readonly overdriveHackId: OverdriveHackId }
      | { readonly type: "charge.accepted" }
      | { readonly type: "charge.rejected" }
      | { readonly type: "xstate.done.actor.resolveHackActor"; readonly output: Option.Option<OverdriveHackEffect> };
  },
  actions: {
    // Save the resolved effect to context for the charging state to apply once the score is settled
    savePendingEffect: assign(({ context, event }) => {
      assertEvent(event, "xstate.done.actor.resolveHackActor");
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
          const applied = Match.value(effect).pipe(
            Match.tag("EmpApplied", (effect) => ({ ...context, empNukedLetters: [...context.empNukedLetters, ...effect.letters] })),
            Match.tag("SonarApplied", (effect) => ({
              ...context,
              sonarReveals: [...context.sonarReveals, { vowel: effect.vowel, positions: effect.positions }],
            })),
            Match.tag("OverrideApplied", (effect) => ({ ...context, theOverride: Option.some(effect.theOverride) })),
            Match.exhaustive
          );
          return { ...applied, pendingEffect: Option.none() };
        },
      })
    ),

    // Send the resolved effect to game-flow so it can charge the player's score
    requestCharge: ({ event }) => {
      assertEvent(event, "xstate.done.actor.resolveHackActor");
      if (Option.isNone(event.output)) return;

      const effect = event.output.value;
      // Reverse-map the effect tag back to the hack ID for game-flow's cost lookup
      const overdriveHackId: OverdriveHackId = effect._tag === "EmpApplied" ? "emp" : "sonar";
      RuntimeClient.runPromise(Atom.set(gameFlowMachineAtom, { type: "hack.chargeRequested", overdriveHackId }));
    },

    // Filter EMP-nuked keys before forwarding keypresses to the word-challenge machine
    forwardKeyPress: ({ context, event }) => {
      assertEvent(event, "input.keyPressed");
      const normalizedKey = event.pressedKey.toUpperCase();
      if (context.empNukedLetters.includes(normalizedKey)) return;

      RuntimeClient.runPromise(Atom.set(wordChallengeMachineAtom, { type: "keyPressed", pressedKey: event.pressedKey }));
    },
  },
  actors: { resolveHackActor },
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
        "hack.useRequested": { target: "resolving" },
      },
    },

    // Compute hack targets; on success move to charging to settle score
    resolving: {
      on: { "input.keyPressed": { actions: "forwardKeyPress" } },

      invoke: {
        id: "resolveHackActor",
        src: "resolveHackActor",
        input: ({ context, event }) => {
          assertEvent(event, "hack.useRequested");
          return {
            overdriveHackId: event.overdriveHackId,
            empNukedLetters: context.empNukedLetters,
            sonarReveals: context.sonarReveals,
          } as const satisfies ResolveHackActorInput;
        },
        // First branch: no eligible targets → drop the request and return to active (no score change)
        // Second branch: targets found → save the effect and ask game-flow to charge the player's score
        onDone: [
          { guard: ({ event }) => Option.isNone(event.output), target: "active", actions: "applyPendingEffect" },
          { target: "charging", actions: ["savePendingEffect", "requestCharge"] },
        ],
        onError: { target: "active", actions: "applyPendingEffect" },
      },
    },

    // Awaiting score-deduction confirmation from the game-flow machine
    charging: {
      on: {
        "input.keyPressed": { actions: "forwardKeyPress" },
        // Score was accepted → apply the hack effect
        "charge.accepted": { target: "active", actions: "applyPendingEffect" },
        // Not enough score → discard the pending effect and go back
        "charge.rejected": { target: "active", actions: "applyPendingEffect" },
      },
    },
  },
});

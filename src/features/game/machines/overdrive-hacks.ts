// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { setup, assign, assertEvent } from "xstate";
import { gameSettingsSolutionsLanguageAtom } from "@/features/settings/state";
import { runSessionMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";
import { calculateEmpTargets, calculateSonarTarget, computeSonarCandidates } from "@/features/game/domain";

// types
import type { LifelineId, OverdriveHacks, RunSession, TheSecretWord } from "@/features/game/domain";

// constants
import { EMP_COST, INITIAL_OVERDRIVE_HACKS, SONAR_COST, VOWELS_BY_LANGUAGE } from "@/features/game/domain";

// Resolve the cost of a lifeline id (single source of truth — exhaustive at compile time)
const LIFELINE_COSTS = { emp: EMP_COST, sonar: SONAR_COST } as const satisfies Readonly<Record<LifelineId, number>>;
export const lifelineCost = (lifelineId: LifelineId) => LIFELINE_COSTS[lifelineId];

export const overdriveHacksMachine = setup({
  types: {} as {
    events:
      | { readonly type: "gameDataLoaded"; readonly keypad: OverdriveHacks["keypad"] }
      | { readonly type: "solutionsLanguageChanged" }
      | { readonly type: "secretWordPicked"; readonly theSecretWord: TheSecretWord }
      | { readonly type: "lifelineUsed"; readonly lifelineId: LifelineId; readonly currentRunScore: RunSession["runScore"] };
    context: OverdriveHacks;
  },
  guards: {
    canUseLifeline: ({ context, event }) => {
      assertEvent(event, "lifelineUsed");
      if (event.currentRunScore < lifelineCost(event.lifelineId)) return false;
      if (Option.isNone(context.theSecretWord)) return false;
      if (Option.isNone(context.keypad)) return false;
      return true;
    },
  },
  actions: {
    // Mirror the keypad onto context when game data loads (parallel to wordChallenge's mirror)
    saveGameData: assign(({ event }) => {
      assertEvent(event, "gameDataLoaded");
      return { ...INITIAL_OVERDRIVE_HACKS, keypad: event.keypad } as const satisfies OverdriveHacks;
    }),

    // Reset all per-word state when the language changes (new game data load follows).
    resetOnLanguageChanged: assign(() => INITIAL_OVERDRIVE_HACKS satisfies OverdriveHacks),

    // Mirror the secret word on context when a new puzzle begins. Keypad is preserved
    startNewPuzzle: assign(({ context, event }) => {
      assertEvent(event, "secretWordPicked");
      return { ...INITIAL_OVERDRIVE_HACKS, theSecretWord: Option.some(event.theSecretWord), keypad: context.keypad } as const satisfies OverdriveHacks;
    }),

    // Central lifeline application
    applyLifeline: ({ context, event }) =>
      RuntimeClient.runPromise(
        Effect.gen(function* () {
          assertEvent(event, "lifelineUsed");
          const theSecretWord = Option.getOrThrow(context.theSecretWord);
          const keypad = Option.getOrThrow(context.keypad);

          // wordChallenge is the single source of truth for the player's word state
          const wordChallengeContext = (yield* Atom.get(wordChallengeMachineAtom)).context;
          const wordleGuesses = wordChallengeContext.wordleGuesses;

          if (event.lifelineId === "emp") {
            const empResult = yield* calculateEmpTargets(theSecretWord, wordleGuesses, keypad, wordChallengeContext.empNukedLetters);
            if (Option.isNone(empResult)) return;
            yield* Atom.set(runSessionMachineAtom, { type: "lifelineUsed", cost: EMP_COST, lifelineId: "emp" });
            yield* Atom.set(wordChallengeMachineAtom, { type: "applyNukedLetters", letters: empResult.value });
          } else {
            // Sonar: short-circuit if no un-revealed vowel candidates remain.
            const solutionsLanguage = yield* Atom.get(gameSettingsSolutionsLanguageAtom);
            const vowels = VOWELS_BY_LANGUAGE[solutionsLanguage];
            const alreadyRevealedLetters = wordChallengeContext.sonarRevealedLetters.map((r) => r.vowel);
            const sonarCandidates = computeSonarCandidates(theSecretWord, wordleGuesses, vowels, alreadyRevealedLetters);
            if (sonarCandidates.length === 0) return;

            const sonarResult = yield* calculateSonarTarget(theSecretWord, wordleGuesses, vowels, alreadyRevealedLetters);
            if (Option.isNone(sonarResult)) return;
            const { vowel, positions } = sonarResult.value;
            yield* Atom.set(runSessionMachineAtom, { type: "lifelineUsed", cost: SONAR_COST, lifelineId: "sonar" });
            yield* Atom.set(wordChallengeMachineAtom, { type: "applySonarReveal", vowel, positions });
          }
        })
      ),
  },
}).createMachine({
  id: "overdriveHacks",
  context: INITIAL_OVERDRIVE_HACKS,
  initial: "awaitingData",

  on: {
    // Language changed → reset per-word state and return to awaiting data
    solutionsLanguageChanged: { target: ".awaitingData", actions: "resetOnLanguageChanged" },

    // Keypad handed off by game-data alongside wordChallenge's gameDataLoaded
    gameDataLoaded: { target: ".ready", actions: "saveGameData" },

    // New puzzle picked → start tracking for this word with the secret + language
    secretWordPicked: { guard: ({ context }) => Option.isSome(context.keypad), actions: "startNewPuzzle" },
  },

  states: {
    // Waiting for game data (keypad) to load before lifelines can be used
    awaitingData: {},

    // Lifelines are useable whenever a puzzle is active
    ready: {
      on: {
        lifelineUsed: { guard: "canUseLifeline", actions: "applyLifeline" },
      },
    },
  },
});

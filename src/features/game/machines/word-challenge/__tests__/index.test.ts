// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, HashSet, Option } from "effect";
import { createEffectActor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { wordChallengeMachine } from "@/features/game/machines/word-challenge";

// The word challenge's actions write telemetry and notify the run session
// through shared atoms. These tests cover the machine's own transitions, so
// those side effects are stubbed instead of standing up the atom runtime.
const machine = wordChallengeMachine.provide({
  actions: {
    trackInvalidGuessSubmitted: () => Effect.void,
    trackValidGuessSubmitted: () => Effect.void,
    trackWordWon: () => Effect.void,
    onWordWon: () => Effect.void,
    trackWordLost: () => Effect.void,
    onWordLost: () => Effect.void,
  },
});

const dictionary = Option.some(HashSet.fromIterable(["APPLE", "BANAN"]));

// Drive the machine from `awaitingGameData` to `typing`
const typeWord = Effect.fnUntraced(function* (word: string) {
  const actor = yield* createEffectActor(machine);
  yield* sendAndAwait(actor, { type: "gameDataLoaded", dictionary });
  yield* sendAndAwait(actor, { type: "secretWordPicked", theSecretWord: "APPLE" });
  for (const letter of word) {
    yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: letter });
  }
  return actor;
});

describe("wordChallengeMachine", () => {
  it.effect("rejects an invalid guess through the validating choice", () =>
    Effect.gen(function* () {
      const actor = yield* typeWord("ZZZZZ");

      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "ENTER" });
      expect(actor.getSnapshot().matches("rejected")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("records a valid guess as the validating choice moves into revealing", () =>
    Effect.gen(function* () {
      const actor = yield* typeWord("APPLE");

      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "ENTER" });
      const snapshot = actor.getSnapshot();
      expect(snapshot.matches("revealing")).toBe(true);
      expect(snapshot.context.wordleGuesses).toEqual(["APPLE"]);
      expect(snapshot.context.currentGuessWord).toBe("");
    }).pipe(Effect.scoped)
  );
});

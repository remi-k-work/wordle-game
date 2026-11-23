// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { createEffectActor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { keyboardMachine } from "@/features/game/machines/keyboard";

// The forwarding action writes to the word-challenge send atom; recording here
// keeps the test free of an AtomRegistry while making the forward observable
const forwarded: string[] = [];

const machine = keyboardMachine.provide({
  actions: {
    forwardKeyPress: ({ pressedKey }) => Effect.sync(() => void forwarded.push(pressedKey)),
  },
});

describe("keyboardMachine", () => {
  it.effect("forwards key presses when no letters are blocked", () =>
    Effect.gen(function* () {
      forwarded.length = 0;
      const actor = yield* createEffectActor(machine);

      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "a" });

      expect(forwarded).toEqual(["a"]);
    }).pipe(Effect.scoped)
  );

  it.effect("drops blocked letters (case-insensitively) and forwards the rest", () =>
    Effect.gen(function* () {
      forwarded.length = 0;
      const actor = yield* createEffectActor(machine);

      yield* sendAndAwait(actor, { type: "blockedLettersChanged", blockedLetters: ["A", "B"] });
      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "a" });
      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "B" });
      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "c" });

      expect(forwarded).toEqual(["c"]);
    }).pipe(Effect.scoped)
  );

  it.effect("stops dropping a letter once the block list clears it", () =>
    Effect.gen(function* () {
      forwarded.length = 0;
      const actor = yield* createEffectActor(machine);

      yield* sendAndAwait(actor, { type: "blockedLettersChanged", blockedLetters: ["A"] });
      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "a" });
      yield* sendAndAwait(actor, { type: "blockedLettersChanged", blockedLetters: [] });
      yield* sendAndAwait(actor, { type: "keyPressed", pressedKey: "a" });

      expect(forwarded).toEqual(["a"]);
    }).pipe(Effect.scoped)
  );
});

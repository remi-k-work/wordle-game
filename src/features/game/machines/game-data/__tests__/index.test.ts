// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, HashSet, Option } from "effect";
import { createEffectActor, createEffectLogic, waitFor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { gameDataMachine } from "@/features/game/machines/game-data";
import { EmptySolutionsError } from "@/features/game/machines/game-data/errors";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { SolutionsLanguage } from "@/features/game/domain/models";

// The loading/selecting actors do real RPC work and their completion actions
// fan out to peer machines; these tests cover the machine's own transitions, so
// both are replaced and the fan-out actions are stubbed.
const loadedGameData = {
  solutions: Option.some(["APPLE"]),
  dictionary: Option.some(HashSet.fromIterable(["APPLE"])),
  keypad: Option.some(["A", "P", "L", "E"]),
};

// Records the requested language per load, so a language-change reload is
// observable even though the stub settles instantly
const loadLanguages: string[] = [];
const loadedEvents: string[] = [];
const chosenWords: string[] = [];

const loadOk = createEffectLogic(({ input }: EffectSourceArgs<{ requestedLanguage?: SolutionsLanguage }>) =>
  Effect.sync(() => void loadLanguages.push(input.requestedLanguage ?? "En")).pipe(Effect.as(loadedGameData))
);
const loadFails = createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.fail(new EmptySolutionsError({ reason: "missing" })));
const pickWord = createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.succeed("APPLE"));

const machine = gameDataMachine.provide({
  actors: { onLoadingActor: loadOk, selectSecretWordActor: pickWord },
  actions: {
    onGameDataLoaded: ({ dictionary }) => Effect.sync(() => void loadedEvents.push(Option.isSome(dictionary) ? "some" : "none")),
    onSecretWordSelected: ({ theSecretWord }) => Effect.sync(() => void chosenWords.push(theSecretWord)),
  },
});

const failingMachine = gameDataMachine.provide({
  actors: { onLoadingActor: loadOk, selectSecretWordActor: loadFails },
  actions: { onGameDataLoaded: () => Effect.void, onSecretWordSelected: () => Effect.void },
});

describe("gameDataMachine", () => {
  it.effect("loads game data and becomes ready, notifying the word challenge", () =>
    Effect.gen(function* () {
      loadedEvents.length = 0;
      const actor = yield* createEffectActor(machine);
      yield* waitFor(actor, (current) => current.matches("ready"));

      expect(Option.isSome(actor.getSnapshot().context.solutions)).toBe(true);
      expect(loadedEvents).toEqual(["some"]);
    }).pipe(Effect.scoped)
  );

  it.effect("picks a secret word on request and returns to ready", () =>
    Effect.gen(function* () {
      chosenWords.length = 0;
      const actor = yield* createEffectActor(machine);
      yield* waitFor(actor, (current) => current.matches("ready"));
      yield* sendAndAwait(actor, { type: "nextWordRequested" });
      yield* waitFor(actor, (current) => current.matches("ready") && chosenWords.length > 0);

      expect(chosenWords).toEqual(["APPLE"]);
    }).pipe(Effect.scoped)
  );

  it.effect("reloads for a new language when the solutions language changes", () =>
    Effect.gen(function* () {
      loadLanguages.length = 0;
      const actor = yield* createEffectActor(machine);
      yield* waitFor(actor, (current) => current.matches("ready"));

      yield* sendAndAwait(actor, { type: "solutionsLanguageChanged", solutionsLanguage: "Pl" });
      yield* waitFor(actor, (current) => current.matches("ready") && loadLanguages.length >= 2);

      expect(loadLanguages).toEqual(["En", "Pl"]);
    }).pipe(Effect.scoped)
  );

  it.effect("is terminal in the failure state", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(failingMachine);
      yield* waitFor(actor, (current) => current.matches("ready"));

      yield* sendAndAwait(actor, { type: "nextWordRequested" });
      yield* waitFor(actor, (current) => current.matches("failure"));

      // A failure is terminal: another request cannot revive the machine
      yield* sendAndAwait(actor, { type: "nextWordRequested" });
      expect(actor.getSnapshot().matches("failure")).toBe(true);
    }).pipe(Effect.scoped)
  );
});

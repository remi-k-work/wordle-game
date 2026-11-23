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
import type { GameDataOperation } from "@/features/game/machines/game-data/models";

// The loading/selecting actors do real RPC work and their completion actions
// fan out to peer machines; these tests cover the machine's own transitions, so
// both are replaced and every fan-out action is stubbed.
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
const failures: GameDataOperation[] = [];

const loadOk = createEffectLogic(({ input }: EffectSourceArgs<{ requestedLanguage?: SolutionsLanguage }>) =>
  Effect.sync(() => void loadLanguages.push(input.requestedLanguage ?? "En")).pipe(Effect.as(loadedGameData))
);
const pickWord = createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.succeed("APPLE"));
const hang = createEffectLogic((_args: EffectSourceArgs<unknown>) => Effect.never);

// Fails the first attempt and succeeds the second, so a retry has something to
// recover from; each test creates its own instance, so the counters are fresh.
// The load stub dies rather than raising a typed error: `onLoadingActor`'s error
// union is the RPC client's, and a defect still reaches the machine's `onError`.
const loadFailsOnce = () => {
  let attempts = 0;
  return createEffectLogic((_args: EffectSourceArgs<unknown>): Effect.Effect<typeof loadedGameData> => {
    attempts += 1;
    return attempts === 1 ? Effect.die(new Error("load failed")) : Effect.succeed(loadedGameData);
  });
};

const pickFailsOnce = () => {
  let attempts = 0;
  return createEffectLogic((_args: EffectSourceArgs<unknown>) => {
    attempts += 1;
    return attempts === 1 ? Effect.fail(new EmptySolutionsError({ reason: "empty" })) : Effect.succeed("APPLE");
  });
};

const recordingActions = {
  onGameDataLoaded: ({ dictionary }: { dictionary: (typeof loadedGameData)["dictionary"] }) =>
    Effect.sync(() => void loadedEvents.push(Option.isSome(dictionary) ? "some" : "none")),
  onSecretWordSelected: ({ theSecretWord }: { theSecretWord: string }) => Effect.sync(() => void chosenWords.push(theSecretWord)),
  onGameDataFailed: ({ operation }: { operation: GameDataOperation }) => Effect.sync(() => void failures.push(operation)),
};

const machine = gameDataMachine.provide({
  actors: { onLoadingActor: loadOk, selectSecretWordActor: pickWord },
  actions: recordingActions,
});

// A zero delay turns the deadline into "the next tick", so a hung actor reaches
// `failure` without the test waiting on the real 30s timeout
const timedOutMachine = gameDataMachine.provide({
  delays: { gameDataTimeout: 0 },
  actors: { onLoadingActor: hang, selectSecretWordActor: pickWord },
  actions: recordingActions,
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

  it.effect("recovers from a load failure when the player retries", () =>
    Effect.gen(function* () {
      failures.length = 0;
      const actor = yield* createEffectActor(
        gameDataMachine.provide({
          actors: { onLoadingActor: loadFailsOnce(), selectSecretWordActor: pickWord },
          actions: recordingActions,
        })
      );

      // Failure remembers which operation failed, so the retry can re-enter it
      yield* waitFor(actor, (current) => current.matches("failure"));
      expect(failures).toEqual(["loading"]);

      yield* sendAndAwait(actor, { type: "retryRequested" });
      yield* waitFor(actor, (current) => current.matches("ready"));

      expect(actor.getSnapshot().matches("ready")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("retries the word selection when picking a word fails", () =>
    Effect.gen(function* () {
      failures.length = 0;
      chosenWords.length = 0;
      const actor = yield* createEffectActor(
        gameDataMachine.provide({
          actors: { onLoadingActor: loadOk, selectSecretWordActor: pickFailsOnce() },
          actions: recordingActions,
        })
      );
      yield* waitFor(actor, (current) => current.matches("ready"));

      yield* sendAndAwait(actor, { type: "nextWordRequested" });
      yield* waitFor(actor, (current) => current.matches("failure"));
      expect(failures).toEqual(["selectingWord"]);

      // The retry re-enters selection, not loading: the dictionary is still good
      yield* sendAndAwait(actor, { type: "retryRequested" });
      yield* waitFor(actor, (current) => current.matches("ready") && chosenWords.length > 0);

      expect(chosenWords).toEqual(["APPLE"]);
    }).pipe(Effect.scoped)
  );

  it.effect("times out a hung load", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(timedOutMachine);

      yield* waitFor(actor, (current) => current.matches("failure"));
      expect(actor.getSnapshot().matches("failure")).toBe(true);
    }).pipe(Effect.scoped)
  );
});
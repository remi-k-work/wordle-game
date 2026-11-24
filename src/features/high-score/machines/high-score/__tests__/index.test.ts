// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Option } from "effect";
import { createEffectActor, waitFor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { highScoreMachine } from "@/features/high-score/machines/high-score";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { RpcHighScore } from "@/features/high-score/rpc/requests";

// types
import type { HighScoreEntry } from "@/features/high-score/domain/models";

// The qualification and submission actors do real RPC work; these tests drive
// the machine's own transitions and record the action outcomes instead of
// showing toasts or writing atoms.
const calls: string[] = [];

const makeMachine = () =>
  highScoreMachine.provide({
    actions: {
      onSuccess: () => Effect.sync(() => void calls.push("success")),
      onNoLongerQualified: () => Effect.sync(() => void calls.push("noLongerQualified")),
      onFailure: () => Effect.sync(() => void calls.push("failure")),
      showHighScoreModal: () => Effect.sync(() => void calls.push("modal")),
    },
  });

// Instead of overriding the actors, inject the protocol-faithful RPC test client
// (Step 5a): the real actor logic runs against fixed handler results, so the
// machine -> actor -> RPC path is exercised rather than a hand-rolled fake.
const makeClientLayer = (
  top10: Effect.Effect<ReadonlyArray<HighScoreEntry>>,
  addNew: Effect.Effect<Option.Option<number>>
) =>
  RpcHighScoreClient.layerTest.pipe(
    Layer.provide(
      RpcHighScore.toLayer({
        top10HighScores: () => top10,
        addNewHighScore: () => addNew,
      })
    )
  );

const runFinished = { type: "runFinished", runScore: 100, streak: 2, solutionsLanguage: "En" } as const;

describe("highScoreMachine", () => {
  it.effect("prompts for initials when the finished run qualifies", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(makeMachine());
      yield* sendAndAwait(actor, runFinished);
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }));

      expect(actor.getSnapshot().context.runScore).toBe(100);
    }).pipe(Effect.scoped, Effect.provide(makeClientLayer(Effect.succeed([]), Effect.succeedNone)))
  );

  it.effect("records the score and reaches success when the submission takes a slot", () =>
    Effect.gen(function* () {
      calls.length = 0;
      const actor = yield* createEffectActor(makeMachine());
      yield* sendAndAwait(actor, runFinished);
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }));

      yield* sendAndAwait(actor, { type: "initialsSubmitted", playerName: "ABC" });
      yield* waitFor(actor, (current) => current.matches("success"));

      expect(calls).toEqual(["success"]);
    }).pipe(Effect.scoped, Effect.provide(makeClientLayer(Effect.succeed([]), Effect.succeedSome(7))))
  );

  it.effect("returns to awaiting when the submission finds the board full", () =>
    Effect.gen(function* () {
      calls.length = 0;
      const actor = yield* createEffectActor(makeMachine());
      yield* sendAndAwait(actor, runFinished);
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }));

      yield* sendAndAwait(actor, { type: "initialsSubmitted", playerName: "ABC" });
      yield* waitFor(actor, (current) => current.matches("awaitingFinishedRun") && calls.length > 0);

      expect(calls).toEqual(["noLongerQualified"]);
    }).pipe(Effect.scoped, Effect.provide(makeClientLayer(Effect.succeed([]), Effect.succeedNone)))
  );

  it.effect("lets a newer finished run take over whatever the machine was doing", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(makeMachine());
      yield* sendAndAwait(actor, runFinished);
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }));

      yield* sendAndAwait(actor, { type: "runFinished", runScore: 999, streak: 5, solutionsLanguage: "Pl" });
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }) && current.context.runScore === 999);

      expect(actor.getSnapshot().context).toMatchObject({ runScore: 999, streak: 5, solutionsLanguage: "Pl" });
    }).pipe(Effect.scoped, Effect.provide(makeClientLayer(Effect.succeed([]), Effect.succeedNone)))
  );
});

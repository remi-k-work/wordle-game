// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { createEffectActor, createEffectLogic, waitFor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { highScoreMachine } from "@/features/high-score/machines/high-score";

// types
import type { EffectSourceArgs } from "@xstate/effect";
import type { HighScoreEntry } from "@/features/high-score/domain/models";

// The qualification and submission actors do real RPC work; these tests drive
// the machine's own transitions with fixed actor results and record the action
// outcomes instead of showing toasts or writing atoms.
const calls: string[] = [];

const makeMachine = (top10: Effect.Effect<ReadonlyArray<HighScoreEntry>>, addNew: Effect.Effect<Option.Option<number>>) =>
  highScoreMachine.provide({
    actions: {
      onSuccess: () => Effect.sync(() => void calls.push("success")),
      onNoLongerQualified: () => Effect.sync(() => void calls.push("noLongerQualified")),
      onFailure: () => Effect.sync(() => void calls.push("failure")),
      showHighScoreModal: () => Effect.sync(() => void calls.push("modal")),
    },
    actors: {
      top10HighScoresActor: createEffectLogic((_args: EffectSourceArgs<unknown>) => top10),
      addNewHighScoreActor: createEffectLogic((_args: EffectSourceArgs<unknown>) => addNew),
    },
  });

const runFinished = { type: "runFinished", runScore: 100, streak: 2, solutionsLanguage: "En" } as const;

describe("highScoreMachine", () => {
  it.effect("prompts for initials when the finished run qualifies", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(makeMachine(Effect.succeed([]), Effect.succeedNone));
      yield* sendAndAwait(actor, runFinished);
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }));

      expect(actor.getSnapshot().context.runScore).toBe(100);
    }).pipe(Effect.scoped)
  );

  it.effect("records the score and reaches success when the submission takes a slot", () =>
    Effect.gen(function* () {
      calls.length = 0;
      const actor = yield* createEffectActor(makeMachine(Effect.succeed([]), Effect.succeedSome(7)));
      yield* sendAndAwait(actor, runFinished);
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }));

      yield* sendAndAwait(actor, { type: "initialsSubmitted", playerName: "ABC" });
      yield* waitFor(actor, (current) => current.matches("success"));

      expect(calls).toEqual(["success"]);
    }).pipe(Effect.scoped)
  );

  it.effect("returns to awaiting when the submission finds the board full", () =>
    Effect.gen(function* () {
      calls.length = 0;
      const actor = yield* createEffectActor(makeMachine(Effect.succeed([]), Effect.succeedNone));
      yield* sendAndAwait(actor, runFinished);
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }));

      yield* sendAndAwait(actor, { type: "initialsSubmitted", playerName: "ABC" });
      yield* waitFor(actor, (current) => current.matches("awaitingFinishedRun") && calls.length > 0);

      expect(calls).toEqual(["noLongerQualified"]);
    }).pipe(Effect.scoped)
  );

  it.effect("lets a newer finished run take over whatever the machine was doing", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(makeMachine(Effect.succeed([]), Effect.succeedNone));
      yield* sendAndAwait(actor, runFinished);
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }));

      yield* sendAndAwait(actor, { type: "runFinished", runScore: 999, streak: 5, solutionsLanguage: "Pl" });
      yield* waitFor(actor, (current) => current.matches({ form: "enteringInitials" }) && current.context.runScore === 999);

      expect(actor.getSnapshot().context).toMatchObject({ runScore: 999, streak: 5, solutionsLanguage: "Pl" });
    }).pipe(Effect.scoped)
  );
});

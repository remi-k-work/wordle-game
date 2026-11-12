import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit, Fiber, Option } from "effect";
import { withAiFallback } from "../helpers.server";

// `withAiFallback` backs the non-critical AI enrichment RPCs (riddle, override,
// TTS audio): its job is to degrade to `None` on ANY non-interrupting failure so
// one bad generation never fails the request. These tests pin that contract —
// especially the defect case, which the previous `orElseSucceed` recovery did
// not cover (it left defects in the error channel)

describe("withAiFallback", () => {
  it.effect("degrades a typed failure to None", () =>
    Effect.gen(function* () {
      const result = yield* withAiFallback(Effect.fail("AiProviderError"), Effect.succeedNone);

      expect(result).toStrictEqual(Option.none());
    })
  );

  it.effect("degrades a defect to None (the recovery is cause-based, not error-based)", () =>
    Effect.gen(function* () {
      const result = yield* withAiFallback(Effect.die(new Error("unexpected defect")), Effect.succeedNone);

      expect(result).toStrictEqual(Option.none());
    })
  );

  it.effect("preserves a successful generation", () =>
    Effect.gen(function* () {
      const result = yield* withAiFallback(Effect.succeedSome("a perfectly good riddle"), Effect.succeedNone);

      expect(result).toStrictEqual(Option.some("a perfectly good riddle"));
    })
  );

  it.effect("lets a pure interruption propagate instead of degrading", () =>
    Effect.gen(function* () {
      // Forked (not awaited inline) so the interrupt does not take down the test fiber itself.
      // No sleep is needed (and none is possible under `it.effect`'s virtual TestClock):
      // the child self-interrupts the moment it runs, and `Fiber.await` waits for exactly that
      const fiber = yield* Effect.forkChild(withAiFallback(Effect.interrupt, Effect.succeedNone));

      const exit = yield* Fiber.await(fiber);
      expect(Exit.isFailure(exit)).toBe(true);
      // Re-narrowing so the cause access is typed: the exit carries no failure
      // in its type, the interrupt only shows up at runtime
      if (!Exit.isFailure(exit)) return;
      expect(Cause.hasInterrupts(exit.cause)).toBe(true);
    })
  );
});

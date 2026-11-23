// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import { createEffectActor } from "@xstate/effect";
import { sendAndAwait } from "@xstate/effect/test";
import { modalMachine } from "@/machines/modal";

describe("modalMachine", () => {
  it.effect("opens the requested modal and closes on demand", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(modalMachine);

      yield* sendAndAwait(actor, { type: "opened", modalType: "help" });
      expect(actor.getSnapshot().matches("help")).toBe(true);

      yield* sendAndAwait(actor, { type: "opened", modalType: "status" });
      expect(actor.getSnapshot().matches("status")).toBe(true);

      yield* sendAndAwait(actor, { type: "closed" });
      expect(actor.getSnapshot().matches("closed")).toBe(true);
    }).pipe(Effect.scoped)
  );

  it.effect("switches directly between two open modals", () =>
    Effect.gen(function* () {
      const actor = yield* createEffectActor(modalMachine);

      yield* sendAndAwait(actor, { type: "opened", modalType: "high-score" });
      yield* sendAndAwait(actor, { type: "opened", modalType: "override-hack" });

      expect(actor.getSnapshot().matches("override-hack")).toBe(true);
    }).pipe(Effect.scoped)
  );
});

// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { WordEnrichment } from "@/services/word-enrichment.server";

// The test layer is the seam RPC handler tests resolve `WordEnrichment` through,
// so these tests pin its contract: fixed values by default, fixtures win.
describe("WordEnrichment.layerTest", () => {
  it.effect("returns the fixed enrichment values", () =>
    Effect.gen(function* () {
      const enrichment = yield* WordEnrichment;

      expect(yield* enrichment.riddle("APPLE", "En", Option.none())).toStrictEqual(Option.some("A test riddle."));
      expect(yield* enrichment.override("APPLE", Option.none(), Option.none(), [], "En")).toStrictEqual(Option.some("A test override."));
    }).pipe(Effect.provide(WordEnrichment.layerTest()))
  );

  it.effect("lets a fixture override a method", () =>
    Effect.gen(function* () {
      const enrichment = yield* WordEnrichment;

      expect(yield* enrichment.riddle("APPLE", "En", Option.none())).toStrictEqual(Option.none());
    }).pipe(Effect.provide(WordEnrichment.layerTest({ riddle: () => Effect.succeedNone })))
  );
});

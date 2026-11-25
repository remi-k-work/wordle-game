// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { ConfigProvider, Effect, Layer, Option } from "effect";
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

// The real layer reads `AI_SWITCH` once at build time and supplies it to every
// generation. With it off, the AI-off fallback is served without touching the
// provider plan (no request, so the client config can be dummy values)
describe("WordEnrichment.layer", () => {
  it.effect("serves the AI-off fallback when AI_SWITCH is off", () =>
    Effect.gen(function* () {
      const enrichment = yield* WordEnrichment;

      expect(yield* enrichment.riddle("APPLE", "En", Option.none())).toStrictEqual(Option.some("No riddle available in the AI off mode."));
    }).pipe(
      Effect.provide(
        WordEnrichment.layer.pipe(
          Layer.provide(
            ConfigProvider.layer(
              ConfigProvider.fromUnknown({
                AI_SWITCH: "off",
                OPENROUTER_API_KEY: "test-key",
                CLOUDFLARE_WORKERS_AI_API_TOKEN: "test-token",
                CLOUDFLARE_ACCOUNT_ID: "test-account",
              })
            )
          )
        )
      )
    )
  );
});

// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, PubSub, Tracer } from "effect";
import { TelemetryHub } from "@/features/telemetry/services/telemetry-hub";

// The hub's PubSub stores `Tracer.Span`s, not arbitrary values, so a test needs a
// real span to publish: a throwaway tracer that records the spans Effect creates.
const makeCaptureTracer = (spans: Array<Tracer.Span>) =>
  Tracer.make({
    span: (options) => {
      const span = new Tracer.NativeSpan(options);
      spans.push(span);
      return span;
    },
  });

// The test layer only has to expose a working PubSub; these tests pin that a span
// published through it reaches a subscriber.
describe("TelemetryHub.layerTest", () => {
  it.effect("delivers a published span to a subscriber", () =>
    Effect.gen(function* () {
      const { spanPubSub } = yield* TelemetryHub;
      const subscription = yield* PubSub.subscribe(spanPubSub);

      // Subscribe before publishing (a PubSub delivers only to current subscribers)
      const spans: Array<Tracer.Span> = [];
      yield* Effect.succeed("ok").pipe(
        Effect.withSpan("telemetry-hub-test-span"),
        Effect.provideService(Tracer.Tracer, makeCaptureTracer(spans))
      );

      expect(spans).toHaveLength(1);
      const span = spans[0];
      expect(span.name).toBe("telemetry-hub-test-span");

      yield* PubSub.publish(spanPubSub, span);
      const received = yield* PubSub.take(subscription);

      expect(received).toBe(span);
    }).pipe(Effect.provide(TelemetryHub.layerTest))
  );
});

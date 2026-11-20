// services, features, and other libraries
import { Context, Effect, Layer, PubSub } from "effect";

// types
import type { Tracer } from "effect";

// TelemetryHub is the central rendezvous point for all telemetry data (bridge between the OpenTelemetry (push) and the Effect Stream Worker (pull))
export class TelemetryHub extends Context.Service<
  TelemetryHub,
  {
    readonly spanPubSub: PubSub.PubSub<Tracer.Span>;
  }
>()("TelemetryHub") {
  static readonly layer = Layer.effect(
    TelemetryHub,
    Effect.gen(function* () {
      // acquireRelease ties the PubSub's shutdown to the layer's scope: the service is disposed together with the runtime that built it
      const spanPubSub = yield* Effect.acquireRelease(PubSub.unbounded<Tracer.Span>(), (pubsub) => PubSub.shutdown(pubsub));

      return TelemetryHub.of({ spanPubSub });
    })
  );
}

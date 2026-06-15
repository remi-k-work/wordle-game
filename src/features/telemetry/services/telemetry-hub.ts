// services, features, and other libraries
import { Context, Effect, Layer, PubSub } from "effect";

// types
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";

// TelemetryHub is the central rendezvous point for all telemetry data (bridge between the OpenTelemetry (push) and the Effect Stream Worker (pull))
export class TelemetryHub extends Context.Service<TelemetryHub>()("TelemetryHub", {
  make: Effect.gen(function* () {
    const spanPubSub = yield* PubSub.unbounded<ReadableSpan[]>();

    // Ensure the PubSub is properly shut down when the service is no longer needed
    yield* Effect.addFinalizer(() => PubSub.shutdown(spanPubSub));

    return { spanPubSub } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}

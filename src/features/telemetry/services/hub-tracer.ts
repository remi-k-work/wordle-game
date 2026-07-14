// services, features, and other libraries
import { Effect, Layer, PubSub, Tracer } from "effect";
import { TelemetryHub } from "./telemetry-hub";

// types
import type { Exit } from "effect";

// HubTracer is a custom Effect Tracer that pushes ended spans into the TelemetryHub PubSub
export const HubTracerLayer = Layer.effect(
  Tracer.Tracer,
  Effect.gen(function* () {
    const { spanPubSub } = yield* TelemetryHub;

    return Tracer.make({
      span(options) {
        return new HubSpan(options, spanPubSub);
      },
    });
  })
);

// HubSpan is a Tracer.Span that publishes itself to a PubSub when it ends
class HubSpan extends Tracer.NativeSpan {
  constructor(
    options: ConstructorParameters<typeof Tracer.NativeSpan>[0],
    private readonly spanPubSub: PubSub.PubSub<Tracer.Span>
  ) {
    super(options);
  }

  override end(endTime: bigint, exit: Exit.Exit<unknown, unknown>) {
    super.end(endTime, exit);

    // Only publish sampled spans; filter out internal RPC noise
    if (this.sampled && this.name !== "http.client POST") PubSub.publishUnsafe(this.spanPubSub, this);
  }
}

// services, features, and other libraries
import { PubSub } from "effect";

// types
import type { SpanExporter, ReadableSpan } from "@opentelemetry/sdk-trace-base";
import type { ExportResult } from "@opentelemetry/core";

// HubSpanExporter is a minimal OpenTelemetry SpanExporter that relays spans into an Effect PubSub
export class HubSpanExporter implements SpanExporter {
  constructor(private readonly spanPubSub: PubSub.PubSub<ReadableSpan[]>) {}

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void) {
    // Filter out internal RPC noise before it hits our worker
    const filteredSpans = spans.filter(({ name }) => name !== "http.client POST");
    if (filteredSpans.length > 0) PubSub.publishUnsafe(this.spanPubSub, filteredSpans);

    // 0 indicates success; we should inform OTel that we "handled" it to prevent any complaints
    resultCallback({ code: 0 });
  }

  shutdown() {
    return Promise.resolve();
  }
}

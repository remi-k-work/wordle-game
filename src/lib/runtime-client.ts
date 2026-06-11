// services, features, and other libraries
import { Layer, Logger } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { RpcGameClient } from "@/features/game/rpc/client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { WebSdk } from "@effect/opentelemetry";
import { ConsoleSpanExporter, BatchSpanProcessor, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

// types
import type { ReadableSpan } from "@opentelemetry/sdk-trace-base";
import type { ExportResult } from "@opentelemetry/core";

// --- Custom Exporter to swallow the RPC noise ---
class FilteredConsoleExporter extends ConsoleSpanExporter {
  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void) {
    // Filter out the automatic RPC spans
    const myGameSpans = spans.filter((span) => span.name !== "http.client POST");

    if (myGameSpans.length > 0) {
      super.export(myGameSpans, resultCallback);
    } else {
      // 0 means success, tell OTel we "handled" it so it doesn't complain
      resultCallback({ code: 0 });
    }
  }
}

const TelemetryLayer = WebSdk.layer(() => ({
  resource: { serviceName: "wordle-overdrive-telemetry" },
  spanProcessor: new SimpleSpanProcessor(new FilteredConsoleExporter()),
  // metricReader: new PeriodicExportingMetricReader({ exporter: new ConsoleMetricExporter(), exportIntervalMillis: 100000 }),
}));

const MainLayer = Layer.mergeAll(
  Logger.layer([Logger.consolePretty()]),
  BrowserKeyValueStore.layerLocalStorage,
  RpcGameClient.layer,
  RpcHighScoreClient.layer,
  TelemetryLayer
);

export const RuntimeAtom = Atom.runtime(MainLayer);

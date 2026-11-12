// types
import type { BrowseCharts } from "./models";
import type { metrics } from "@/features/telemetry/domain/metrics";

// `global_pulse` metric names, derived from the telemetry registry that writes
// them. The chart queries read the same rows, so renaming a metric or adding one
// is a compile error at the query call sites rather than a silently empty chart.
// `import type` keeps the registry (and effect's Metric module) out of the
// client bundle — only the literal union survives into the emitted JavaScript
export type MetricName = keyof typeof metrics;

// SQL column aliases the histogram queries select. Unlike `metricName` these are
// spliced into the statement text rather than bound as parameters, so they are a
// literal union instead of `string`: adding a chart means adding an alias here,
// and a typo is a compile error instead of a Postgres syntax error at runtime
export type BucketAlias = "turn" | "max_seconds" | "streak";

// constants
export const INITIAL_BROWSE_CHARTS = { sl: "En" } as const satisfies BrowseCharts;

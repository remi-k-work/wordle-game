// Span names of the two telemetry streams. They must stay in sync with the
// `Effect.fn(name)` labels in @/features/telemetry/state/actions: the worker
// matches on these names, so a rename that lands on one side only silently
// drops the entire stream
export const SPAN_LOG_WORD_WON = "logWordWon";
export const SPAN_LOG_RUN_COMPLETED = "logRunCompleted";

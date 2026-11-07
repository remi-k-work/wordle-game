// services, features, and other libraries
import { AsyncResult } from "effect/reactivity";

// components
import { ChartEmpty } from "@/features/charts/ui/chart-empty";

// types
import type { ReactNode } from "react";

interface ChartSectionProps<Rows, Error> {
  // Rendered by both the empty state and the chart itself, so the heading a
  // section shows never depends on which of the two states it happens to be in
  title: string;
  // The atom value the section renders from; the rows arrive inside an
  // `AsyncResult` because every chart here is a session-scoped async read
  result: AsyncResult.AsyncResult<ReadonlyArray<Rows>, Error>;
  // Shown while the rows are in flight and when the read fails: the charts
  // deliberately do not distinguish "not loaded yet" from "failed to load",
  // because both mean the same thing to the visitor — no rows to look at
  skeleton: ReactNode;
  // Why there is nothing to plot, when the read resolves to zero rows
  emptyMessage: string;
  // The chart itself, given the rows it should plot
  children: (rows: ReadonlyArray<Rows>) => ReactNode;
}

// The lifecycle every chart in this feature runs: skeleton while loading, empty state when the rows resolve to nothing, chart otherwise
export function ChartSection<Rows, Error>({ title, result, skeleton, emptyMessage, children }: ChartSectionProps<Rows, Error>) {
  return AsyncResult.matchWithWaiting(result, {
    onWaiting: () => skeleton,
    onError: () => skeleton,
    onDefect: () => skeleton,
    onSuccess: ({ value: rows }) => (rows.length === 0 ? <ChartEmpty title={title} message={emptyMessage} /> : children(rows)),
  });
}

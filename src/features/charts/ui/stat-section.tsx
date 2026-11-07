// services, features, and other libraries
import { AsyncResult } from "effect/reactivity";

// types
import type { ReactNode } from "react";

interface StatSectionProps<Value, Error> {
  // The atom value the section renders from; a single async read rather than a
  // row list, which is what makes this the sibling of `ChartSection`
  result: AsyncResult.AsyncResult<Value, Error>;
  // Shown while the read is in flight and when it fails: these stats
  // deliberately do not distinguish "not loaded yet" from "failed to load",
  // because both mean the same thing to the visitor — nothing to look at yet
  skeleton: ReactNode;
  // The stat itself, given the value the success branch resolved
  children: (value: Value) => ReactNode;
}

// The lifecycle every single-value stat on this page runs: skeleton while the read is in flight, the stat once it resolves
export function StatSection<Value, Error>({ result, skeleton, children }: StatSectionProps<Value, Error>): ReactNode {
  return AsyncResult.matchWithWaiting(result, {
    onWaiting: () => skeleton,
    onError: () => skeleton,
    onDefect: () => skeleton,
    onSuccess: ({ value }) => children(value),
  });
}

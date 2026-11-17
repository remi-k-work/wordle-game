// services, features, and other libraries
import { Array, Option } from "effect";

// BucketKey
// ---------------------------------------------------------------------------
// The bucket column of a distribution row: the string keys whose value may be
// null (the trailing cumulative-total bucket). Deriving the key from the column
// type keeps non-bucket columns (the counts, the percentages) out of the
// bucket's type, where passing one would silently no-op
// Shared by the DB layer (which drops or keeps that row) and the state layer
// (which resolves it to an unbounded bucket), so both spell the same column
// concept once
export type BucketKey<Row> = {
  [K in keyof Row & string]: null extends Row[K] ? K : never;
}[keyof Row & string];

// Telemetry stores histograms in cumulative form because they are easy to
// aggregate in SQL. This helper converts cumulative buckets back into a
// discrete distribution suitable for charting and derives percentages from
// the final cumulative total

/**
 * Converts an array of cumulative histogram rows into discrete per-bucket
 * counts and their percentage of the total
 *
 * Invariants the caller MUST uphold (two-layer, both load-bearing):
 * 1. `rows` are ordered by bucket ascending — e.g. `ORDER BY turn / streak /
 *    max_seconds ASC NULLS LAST` in every upstream SQL query. A future query
 *    that forgets `ORDER BY … ASC` silently mis-rounds every percentage.
 * 2. The final row holds the maximum cumulative total. The SQL emits a
 *    trailing `[null, N]` bucket (see D1) and orders it last; this row is the
 *    percentage denominator. Callers that filter the NULL row out for display
 *    must do so AFTER this helper runs (see charts-db.ts getGuessDistribution)
 *
 * Not replaced with `Math.max(...)` — the helper sits on a hot path and the
 * single `rows.map(...)` over the already-ordered array is cheap enough that
 * adding a second pass to hunt for the max is wasteful
 */
export const cumulativeToDistribution = <T extends { personal: number; global: number }, TResult>(
  rows: readonly T[],
  mapResult: (row: T, discretePersonal: number, discreteGlobal: number, personalPct: number, globalPct: number) => TResult
): TResult[] => {
  const { personal: totalPersonal, global: totalGlobal } = Option.getOrElse(Array.last(rows), () => ({ personal: 0, global: 0 }));

  const [, distribution] = Array.mapAccum(rows, { personal: 0, global: 0 }, (prev, row) => {
    const discretePersonal = row.personal - prev.personal;
    const discreteGlobal = row.global - prev.global;

    const personalPct = totalPersonal > 0 ? Math.round((discretePersonal / totalPersonal) * 100) : 0;
    const globalPct = totalGlobal > 0 ? Math.round((discreteGlobal / totalGlobal) * 100) : 0;

    return [{ personal: row.personal, global: row.global }, mapResult(row, discretePersonal, discreteGlobal, personalPct, globalPct)];
  });

  return distribution;
};

// Treats a missing cumulative-total bucket (NULL) as unbounded (Infinity) for charting
export const nullToInfinity = (value: number | null) => value ?? Infinity;

/**
 * Resolves an open-ended distribution's trailing NULL bucket to `Infinity` ("20+
 * seconds", "5+ wins"). The NULL row is the cumulative total the percentages are
 * derived from, so ChartsDB deliberately keeps it; the state layer is what turns
 * it into a chartable open-ended bucket
 *
 * `bucket` is typed by `BucketKey`, so the call site can only name a column whose
 * value may be null — passing a count or a percentage column fails to compile
 * rather than silently becoming a no-op
 *
 * `Row` is constrained to `object` rather than `Readonly<Record<string, unknown>>`
 * so decoded `Schema.Class` rows (whose type has no index signature) are accepted
 * too: the bucket key is still derived from the column type, so the compile-time
 * guarantee above is unchanged
 */
export const withUnboundedBucket =
  <Row extends object>(bucket: BucketKey<Row>) =>
  (rows: ReadonlyArray<Row>): Row[] =>
    // Spreading each row (a decoded Schema.Class) deliberately drops its
    // prototype: the rows feed recharts as plain data objects, and no consumer
    // calls a class method on them
    rows.map((row) => ({ ...row, [bucket]: nullToInfinity(row[bucket] as number | null) }));

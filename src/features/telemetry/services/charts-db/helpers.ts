// Telemetry stores histograms in cumulative form because they are easy to
// aggregate in SQL. This helper converts cumulative buckets back into a
// discrete distribution suitable for charting and derives percentages from
// the final cumulative total.

/**
 * Converts an array of cumulative histogram rows into discrete per-bucket
 * counts and their percentage of the total.
 *
 * Invariants the caller MUST uphold (two-layer, both load-bearing):
 * 1. `rows` are ordered by bucket ascending — e.g. `ORDER BY turn/streak/
 *    max_seconds ASC NULLS LAST` in every upstream SQL query. A future query
 *    that forgets `ORDER BY … ASC` silently mis-rounds every percentage.
 * 2. The final row holds the maximum cumulative total. The SQL emits a
 *    trailing `[null, N]` bucket (see D1) and orders it last; this row is the
 *    percentage denominator. Callers that filter the NULL row out for display
 *    must do so AFTER this helper runs (see charts-db.ts getGuessDistribution).
 *
 * Not replaced with `Math.max(...)` — the helper sits on a hot path and the
 * single `rows.map(...)` over the already-ordered array is cheap enough that
 * adding a second pass to hunt for the max is wasteful.
 */
export const cumulativeToDistribution = <T extends { personal: number; global: number }, TResult>(
  rows: readonly T[],
  mapResult: (row: T, discretePersonal: number, discreteGlobal: number, personalPct: number, globalPct: number) => TResult
): TResult[] => {
  let prevPersonalCumulative = 0;
  let prevGlobalCumulative = 0;

  const totalPersonal = rows.length > 0 ? rows[rows.length - 1].personal : 0;
  const totalGlobal = rows.length > 0 ? rows[rows.length - 1].global : 0;

  return rows.map((row) => {
    const discretePersonal = row.personal - prevPersonalCumulative;
    const discreteGlobal = row.global - prevGlobalCumulative;

    prevPersonalCumulative = row.personal;
    prevGlobalCumulative = row.global;

    const personalPct = totalPersonal > 0 ? Math.round((discretePersonal / totalPersonal) * 100) : 0;
    const globalPct = totalGlobal > 0 ? Math.round((discreteGlobal / totalGlobal) * 100) : 0;

    return mapResult(row, discretePersonal, discreteGlobal, personalPct, globalPct);
  });
};

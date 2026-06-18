// Telemetry stores histograms in cumulative form because they are easy to
// aggregate in SQL. This helper converts cumulative buckets back into a
// discrete distribution suitable for charting and derives percentages from
// the final cumulative total.
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

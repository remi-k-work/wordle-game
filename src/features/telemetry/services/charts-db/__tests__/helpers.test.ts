import { describe, expect, it } from "@effect/vitest";
import { cumulativeToDistribution } from "../helpers";

describe("cumulativeToDistribution", () => {
  // The SQL queries emit rows in ascending bucket order with a trailing
  // [null, N] bucket holding the metric total (D1). The helper uses
  // rows[rows.length-1] as the percentage denominator. This fixture
  // mirrors line 271 of public_global_pulse_export_2026-07-23_214426.csv:
  //   "buckets":[[1,3],[2,9],[3,10],[4,11],[5,14],[6,16],[null,16]]
  // aggregated across a single personal session and the global scope so
  // the personal + global cumulative columns differ.
  const rows = [
    { turn: 1, personal: 0, global: 3 },
    { turn: 2, personal: 1, global: 9 },
    { turn: 3, personal: 1, global: 10 },
    { turn: 4, personal: 1, global: 11 },
    { turn: 5, personal: 1, global: 14 },
    { turn: 6, personal: 1, global: 16 },
    { turn: null, personal: 1, global: 16 },
  ];

  it("derives discrete counts from cumulative rows", () => {
    const result = cumulativeToDistribution(rows, (row, personal, global) => ({
      turn: row.turn,
      personal,
      global,
    }));

    expect(result.map((r) => r.personal)).toEqual([0, 1, 0, 0, 0, 0, 0]);
    expect(result.map((r) => r.global)).toEqual([3, 6, 1, 1, 3, 2, 0]);
  });

  it("uses the trailing row as the percentage denominator", () => {
    const result = cumulativeToDistribution(rows, (_row, _personal, _global, personalPct, globalPct) => ({
      personalPct,
      globalPct,
    }));

    // global total = 16 (from the trailing row), personal total = 1.
    expect(result.map((r) => r.personalPct)).toEqual([0, 100, 0, 0, 0, 0, 0]);
    expect(result.map((r) => r.globalPct)).toEqual([19, 38, 6, 6, 19, 13, 0]);
  });

  it("preserves the trailing NULL row so callers can filter or render it", () => {
    const result = cumulativeToDistribution(rows, (row) => ({ turn: row.turn }));

    expect(result.length).toBe(7);
    expect(result[result.length - 1].turn).toBeNull();
  });

  it("hiding the NULL row after derivation keeps percentages intact (A3 consumer contract)", () => {
    const result = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
      turn: row.turn,
      personal,
      global,
      personalPct,
      globalPct,
    })).filter((row) => row.turn !== null);

    expect(result.length).toBe(6);
    expect(result.every((r) => r.turn !== null)).toBe(true);
    // percentages were already computed against the trailing row's totals
    expect(result.map((r) => r.globalPct)).toEqual([19, 38, 6, 6, 19, 13]);
  });

  it("returns an empty array for empty input", () => {
    const result = cumulativeToDistribution([] as Array<{ personal: number; global: number; turn: number | null }>, (row) => ({
      turn: row.turn,
    }));
    expect(result).toEqual([]);
  });
});

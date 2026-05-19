import { describe, expect, it } from "@effect/vitest";
import { bankWordScore, finishRunSession, resetCurrentRunSession } from ".";

describe("runSession", () => {
  const session = { runScore: 100, streak: 2, lastRunScore: 50, lastRunStreak: 1, bestRunScore: 120 };

  it("banks word score into run score, streak, and best score", () => {
    expect(bankWordScore(session, { wordScore: 75, basePointsPerTurn: 100, speedMultiplier: 0.8, timeSeconds: 70 })).toEqual({
      runScore: 175,
      streak: 3,
      lastRunScore: 50,
      lastRunStreak: 1,
      bestRunScore: 175,
    });
  });

  it("resets only the active run for a new run", () => {
    expect(resetCurrentRunSession(session)).toEqual({ ...session, runScore: 0, streak: 0 });
  });

  it("finishes a run by preserving last run results", () => {
    expect(finishRunSession(session)).toEqual({
      runScore: 0,
      streak: 0,
      lastRunScore: 100,
      lastRunStreak: 2,
      bestRunScore: 120,
    });
  });
});

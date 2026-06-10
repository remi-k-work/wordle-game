import { describe, expect, it } from "@effect/vitest";
import { bankWordScore, finishRunSession, resetCurrentRunSession } from ".";
import { Option } from "effect";

describe("runSession", () => {
  const session = {
    runId: Option.none(),
    createdAt: Option.none(),
    runScore: 100,
    streak: 2,
    lastRunScore: 50,
    lastStreak: 1,
    bestRunScore: 120,
    bestStreak: 2,
  };

  it("banks word score into run score, streak, and best score", () => {
    expect(bankWordScore(session, { wordScore: 75, basePointsPerTurn: 100, speedMultiplier: 0.8, timeSeconds: 70 })).toEqual({
      runId: Option.none(),
      createdAt: Option.none(),
      runScore: 175,
      streak: 3,
      lastRunScore: 50,
      lastStreak: 1,
      bestRunScore: 175,
      bestStreak: 3,
    });
  });

  it("resets only the active run for a new run", () => {
    expect(resetCurrentRunSession(session)).toEqual({ ...session, runScore: 0, streak: 0, lastRunScore: 0, lastStreak: 0 });
  });

  it("finishes a run by preserving last run results", () => {
    expect(finishRunSession(session)).toEqual({
      runId: Option.none(),
      createdAt: Option.none(),
      runScore: 0,
      streak: 0,
      lastRunScore: 100,
      lastStreak: 2,
      bestRunScore: 120,
      bestStreak: 2,
    });
  });
});

import { describe, expect, it } from "@effect/vitest";
import { DateTime } from "effect";
import { qualifiesForHighScore } from ".";

import type { HighScore } from ".";

const highScore = (score: number, streak: number): HighScore => ({
  playerName: "AAA",
  score,
  streak,
  solutionsLang: "En",
  createdAt: DateTime.makeUnsafe(0),
});

describe("highScore", () => {
  describe("qualifiesForHighScore", () => {
    it("accepts any score when there are fewer than 10 high scores", () => {
      expect(qualifiesForHighScore([], 0, 0)).toBe(true);
      expect(qualifiesForHighScore([highScore(100, 2)], 0, 0)).toBe(true);
    });

    it("accepts a score higher than the 10th place score", () => {
      const top10 = Array.from({ length: 10 }, () => highScore(100, 5));

      expect(qualifiesForHighScore(top10, 101, 0)).toBe(true);
    });

    it("accepts an equal score when the streak is higher than the 10th place streak", () => {
      const top10 = Array.from({ length: 10 }, () => highScore(100, 5));

      expect(qualifiesForHighScore(top10, 100, 6)).toBe(true);
    });

    it("rejects an equal score when the streak is equal to the 10th place streak", () => {
      const top10 = Array.from({ length: 10 }, () => highScore(100, 5));

      expect(qualifiesForHighScore(top10, 100, 5)).toBe(false);
    });

    it("rejects an equal score when the streak is lower than the 10th place streak", () => {
      const top10 = Array.from({ length: 10 }, () => highScore(100, 5));

      expect(qualifiesForHighScore(top10, 100, 4)).toBe(false);
    });

    it("rejects a lower score even when the streak is higher than the 10th place streak", () => {
      const top10 = Array.from({ length: 10 }, () => highScore(100, 5));

      expect(qualifiesForHighScore(top10, 99, 99)).toBe(false);
    });
  });
});

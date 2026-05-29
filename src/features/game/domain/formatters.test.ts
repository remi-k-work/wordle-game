import { describe, expect, it } from "@effect/vitest";
import { formatGuess, speedMultiplierToCategory } from "./formatters";

describe("formatters", () => {
  describe("formatGuess", () => {
    it("marks all grey if no letters match", () => {
      const result = formatGuess("APPLE", "BIRDS");
      expect(result.every((t) => t.color === "grey")).toBe(true);
    });

    it("marks green for correct positions", () => {
      const result = formatGuess("APPLE", "AMPLE");
      expect(result[0].color).toBe("green"); // A
      expect(result[1].color).toBe("grey"); // M
      expect(result[2].color).toBe("green"); // P
      expect(result[3].color).toBe("green"); // L
      expect(result[4].color).toBe("green"); // E
    });

    it("marks yellow for correct letters in wrong positions", () => {
      const result = formatGuess("APPLE", "PEACH");
      expect(result[0].color).toBe("yellow"); // P
      expect(result[1].color).toBe("yellow"); // E
      expect(result[2].color).toBe("yellow"); // A
      expect(result[3].color).toBe("grey"); // C
      expect(result[4].color).toBe("grey"); // H
    });

    it("handles duplicate letters correctly (Wordle rules)", () => {
      // Secret has one 'A', guess has two. First should be yellow, second grey.
      const result1 = formatGuess("APPLE", "AALAS");
      expect(result1[0].color).toBe("green"); // A (correct)
      expect(result1[1].color).toBe("grey"); // A (duplicate, not in word anymore)

      // Secret has two 'B's, guess has three.
      const result2 = formatGuess("ABBEY", "BABES");
      expect(result2[0].color).toBe("yellow"); // B (at index 0, exists at 1 or 2)
      expect(result2[1].color).toBe("yellow"); // A (at index 1, exists at 0)
      expect(result2[2].color).toBe("green"); // B (at index 2, correct)
      expect(result2[3].color).toBe("green"); // E (at index 3, correct)
      expect(result2[4].color).toBe("grey"); // S (at index 4, not in word)
    });

    it("prioritizes green over yellow for duplicates: ABBEY vs BABES", () => {
      const result = formatGuess("ABBEY", "BABES");
      // Secret: A B B E Y
      // Guess:  B A B E S
      // G:      . . B E .  (B at index 2, E at index 3 are green)
      // Y:      B A . . .  (B at index 0 is yellow (matches index 1), A at index 1 is yellow (matches index 0))
      expect(result[0].color).toBe("yellow"); // B
      expect(result[1].color).toBe("yellow"); // A
      expect(result[2].color).toBe("green"); // B
      expect(result[3].color).toBe("green"); // E
      expect(result[4].color).toBe("grey"); // S
    });

    it("handles complex duplicate case: ABBEY vs KEBAB", () => {
      const result = formatGuess("ABBEY", "KEBAB");
      // Secret: A B B E Y
      // Guess:  K E B A B
      // G:      . . B . . (B at index 2 is green)
      // Y:      . E . A B (E matches 3, A matches 0, B matches 1)
      expect(result[0].color).toBe("grey"); // K
      expect(result[1].color).toBe("yellow"); // E
      expect(result[2].color).toBe("green"); // B
      expect(result[3].color).toBe("yellow"); // A
      expect(result[4].color).toBe("yellow"); // B
    });
  });

  describe("speedMultiplierToCategory", () => {
    it("returns correct categories", () => {
      expect(speedMultiplierToCategory(1.5)).toBe("🚀 Speed Demon");
      expect(speedMultiplierToCategory(0.8)).toBe("🐌 Slow Learner");
    });
  });
});

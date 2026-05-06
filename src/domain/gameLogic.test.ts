import { describe, it, expect } from "vitest";
import { formatGuess, doWeHaveAWinner } from "./gameLogic";

describe("Game Logic", () => {
  describe("formatGuess", () => {
    it("should format a perfect guess as all green", () => {
      const result = formatGuess("APPLE", "APPLE");
      expect(result.every((tile) => tile.color === "green")).toBe(true);
    });

    it("should identify yellow tiles correctly", () => {
      const result = formatGuess("APPLE", "MAPLE");
      // M is grey, A is yellow, P is green, L is green, E is green
      expect(result[0].color).toBe("grey");
      expect(result[1].color).toBe("yellow");
      expect(result[2].color).toBe("green");
      expect(result[3].color).toBe("green");
      expect(result[4].color).toBe("green");
    });

    it("should handle duplicate letters correctly", () => {
      const result = formatGuess("APPLE", "PAPER");
      // P1: yellow, A: yellow, P2: green, E: yellow, R: grey
      expect(result[0].color).toBe("yellow");
      expect(result[1].color).toBe("yellow");
      expect(result[2].color).toBe("green");
      expect(result[3].color).toBe("yellow");
      expect(result[4].color).toBe("grey");
    });
  });

  describe("doWeHaveAWinner", () => {
    it("should return true if the last guess matches the secret word", () => {
      expect(doWeHaveAWinner("APPLE", ["PEARS", "APPLE"])).toBe(true);
    });

    it("should return false if the last guess does not match", () => {
      expect(doWeHaveAWinner("APPLE", ["PEARS", "MAPLE"])).toBe(false);
    });
  });
});

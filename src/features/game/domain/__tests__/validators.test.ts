import { describe, expect, it } from "@effect/vitest";
import { HashSet } from "effect";
import { isGuessKeyValid, canSubmitGuess } from "../validators";

describe("validators", () => {
  describe("isGuessKeyValid", () => {
    it("accepts valid letters", () => {
      expect(isGuessKeyValid("a")).toBe(true);
      expect(isGuessKeyValid("Z")).toBe(true);
      expect(isGuessKeyValid("ą")).toBe(true);
      expect(isGuessKeyValid("Ź")).toBe(true);
    });

    it("accepts control keys", () => {
      expect(isGuessKeyValid("backspace")).toBe(true);
      expect(isGuessKeyValid("ENTER")).toBe(true);
    });

    it("rejects invalid keys", () => {
      expect(isGuessKeyValid("1")).toBe(false);
      expect(isGuessKeyValid("!")).toBe(false);
      expect(isGuessKeyValid(" ")).toBe(false);
      expect(isGuessKeyValid("Escape")).toBe(false);
    });
  });

  describe("canSubmitGuess", () => {
    const dictionary = HashSet.fromIterable(["APPLE", "BANAN", "CHERRY"]);
    const wordleGuesses: string[] = [];
    const currentTurn = 1;

    it("accepts valid 5-letter word in dictionary", () => {
      expect(canSubmitGuess("APPLE", currentTurn, wordleGuesses, dictionary)).toBe(true);
    });

    it("rejects words not in dictionary", () => {
      expect(canSubmitGuess("BANAS", currentTurn, wordleGuesses, dictionary)).toBe(false);
    });

    it("rejects words with incorrect length", () => {
      expect(canSubmitGuess("APP", currentTurn, wordleGuesses, dictionary)).toBe(false);
      expect(canSubmitGuess("CHERRY", currentTurn, wordleGuesses, dictionary)).toBe(false);
    });

    it("rejects duplicate guesses", () => {
      const guesses = ["APPLE"];
      expect(canSubmitGuess("APPLE", 2, guesses, dictionary)).toBe(false);
    });

    it("rejects guesses after turn limit", () => {
      expect(canSubmitGuess("APPLE", 7, wordleGuesses, dictionary)).toBe(false);
    });
  });
});

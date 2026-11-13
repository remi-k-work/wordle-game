import { describe, expect, it } from "@effect/vitest";
import { HashSet } from "effect";
import { canSubmitGuess, classifyKey } from "../validators";

describe("validators", () => {
  describe("classifyKey", () => {
    it("classifies valid letters, normalizing them to uppercase", () => {
      expect(classifyKey("a")).toEqual({ kind: "letter", letter: "A" });
      expect(classifyKey("Z")).toEqual({ kind: "letter", letter: "Z" });
      expect(classifyKey("ą")).toEqual({ kind: "letter", letter: "Ą" });
      expect(classifyKey("Ź")).toEqual({ kind: "letter", letter: "Ź" });
    });

    it("classifies control keys", () => {
      expect(classifyKey("backspace")).toEqual({ kind: "backspace" });
      expect(classifyKey("ENTER")).toEqual({ kind: "enter" });
    });

    it("rejects invalid keys", () => {
      expect(classifyKey("1")).toEqual({ kind: "invalid" });
      expect(classifyKey("!")).toEqual({ kind: "invalid" });
      expect(classifyKey(" ")).toEqual({ kind: "invalid" });
      expect(classifyKey("Escape")).toEqual({ kind: "invalid" });
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

import { describe, expect, it } from "@effect/vitest";
import { Effect, DateTime, Duration, TestClock, HashSet, Option } from "effect";
import { calculateScore, formatDuration, getGameStatus, computeKeypadState, applyGameAction, calculatePotentialScore, deriveGameEvent } from ".";
import { GameActionEnum, INITIAL_GAME_STATE } from ".";

describe("gameLogic", () => {
  describe("calculateScore", () => {
    it.effect("calculates base points correctly for different turns", () =>
      Effect.gen(function* () {
        const start = Option.some(yield* DateTime.now);
        yield* TestClock.adjust(Duration.seconds(45));
        const end = yield* DateTime.now;

        const scoreTurn1 = calculateScore(1, start, end);
        const scoreTurn6 = calculateScore(6, start, end);

        expect(scoreTurn1.basePointsPerTurn).toBe(1000);
        expect(scoreTurn6.basePointsPerTurn).toBe(100);
      })
    );

    it.effect("applies speed multipliers correctly", () =>
      Effect.gen(function* () {
        const start = Option.some(yield* DateTime.now);

        // < 30s: 1.5x
        yield* TestClock.adjust(Duration.seconds(20));
        const scoreFast = calculateScore(4, start, yield* DateTime.now);
        expect(scoreFast.speedMultiplier).toBe(1.5);
        expect(scoreFast.wordScore).toBe(600); // 400 * 1.5

        // < 60s: 1.2x
        // We are already at 20s, add 25s more to reach 45s
        yield* TestClock.adjust(Duration.seconds(25));
        const scoreMedium = calculateScore(4, start, yield* DateTime.now);
        expect(scoreMedium.speedMultiplier).toBe(1.2);
        expect(scoreMedium.wordScore).toBe(480); // 400 * 1.2

        // < 180s: 1.0x
        // We are at 45s, add 75s more to reach 120s
        yield* TestClock.adjust(Duration.seconds(75));
        const scoreSlow = calculateScore(4, start, yield* DateTime.now);
        expect(scoreSlow.speedMultiplier).toBe(1.0);
        expect(scoreSlow.wordScore).toBe(400); // 400 * 1.0

        // >= 180s: 0.8x
        // We are at 120s, add 80s more to reach 200s
        yield* TestClock.adjust(Duration.seconds(80));
        const scoreVerySlow = calculateScore(4, start, yield* DateTime.now);
        expect(scoreVerySlow.speedMultiplier).toBe(0.8);
        expect(scoreVerySlow.wordScore).toBe(320); // 400 * 0.8
      })
    );
  });

  describe("calculatePotentialScore", () => {
    it.effect("calculates potential score correctly based on turn and speed", () =>
      Effect.gen(function* () {
        const start = yield* DateTime.now;

        // Turn 1 (first guess), no time elapsed -> Full base points (1000) * max multiplier (1.5) = 1500
        expect(calculatePotentialScore(1, Option.none(), start)).toBe(1500);

        // Turn 1, 20s elapsed -> 1000 * 1.5 = 1500
        yield* TestClock.adjust(Duration.seconds(20));
        expect(calculatePotentialScore(1, Option.some(start), yield* DateTime.now)).toBe(1500);

        // Turn 3 (two guesses completed), 45s elapsed -> 600 * 1.2 = 720
        // We are at 20s, add 25s more to reach 45s
        yield* TestClock.adjust(Duration.seconds(25));
        expect(calculatePotentialScore(3, Option.some(start), yield* DateTime.now)).toBe(720);
      })
    );
  });

  describe("getGameStatus", () => {
    it("returns Won when last guess matches secret word", () => {
      const status = getGameStatus(1, "APPLE", ["APPLE"]);
      expect(status._tag).toBe("Won");
    });

    it("returns Lost when turn exceeds limit", () => {
      const status = getGameStatus(7, "APPLE", ["BIRDS", "CARDS", "TABLE", "CHAIR", "HOUSE", "PIANO"]);
      expect(status._tag).toBe("Lost");
    });

    it("returns Playing when game is in progress", () => {
      const status = getGameStatus(1, "APPLE", ["BIRDS"]);
      expect(status._tag).toBe("Playing");
    });
  });

  describe("computeKeypadState", () => {
    it("accumulates colors correctly", () => {
      const keypad = computeKeypadState("APPLE", ["AMPLE", "PAPER"]);
      // AMPLE -> A:green, M:grey, P:green, L:green, E:green
      // PAPER -> P:green, A:yellow, P:green, E:green, R:grey
      expect(keypad["A"]).toBe("green"); // yellow in PAPER, but green in AMPLE
      expect(keypad["M"]).toBe("grey");
      expect(keypad["P"]).toBe("green");
      expect(keypad["R"]).toBe("grey");
    });
  });

  describe("applyGameAction", () => {
    const dictionary = HashSet.fromIterable(["APPLE"]);
    const now = DateTime.unsafeMake(0);

    it("handles AddLetter", () => {
      const state = applyGameAction(INITIAL_GAME_STATE, GameActionEnum.AddLetter({ letter: "A" }), dictionary, now);
      expect(state.currentGuessWord).toBe("A");
    });

    it("sets startTime on first letter and preserves it afterward", () => {
      const firstLetterState = applyGameAction(INITIAL_GAME_STATE, GameActionEnum.AddLetter({ letter: "A" }), dictionary, now);
      expect(Option.isSome(firstLetterState.startTime)).toBe(true);

      const later = DateTime.unsafeMake(10_000);
      const secondLetterState = applyGameAction(firstLetterState, GameActionEnum.AddLetter({ letter: "P" }), dictionary, later);
      expect(secondLetterState.startTime).toBe(firstLetterState.startTime);
    });

    it("handles RemoveLetter", () => {
      const state1 = { ...INITIAL_GAME_STATE, currentGuessWord: "AB" };
      const state2 = applyGameAction(state1, GameActionEnum.RemoveLetter(), dictionary, now);
      expect(state2.currentGuessWord).toBe("A");
    });

    it("handles SubmitGuess (valid)", () => {
      const state1 = { ...INITIAL_GAME_STATE, currentGuessWord: "APPLE", theSecretWord: "APPLE" };
      const state2 = applyGameAction(state1, GameActionEnum.SubmitGuess(), dictionary, now);
      expect(state2.wordleGuesses).toContain("APPLE");
      expect(state2.currentTurn).toBe(2);
      expect(state2.currentGuessWord).toBe("");
    });

    it("handles SubmitGuess (invalid word)", () => {
      const dictionaryEmpty = HashSet.empty<string>();
      const state1 = { ...INITIAL_GAME_STATE, currentGuessWord: "APPLE" };
      const state2 = applyGameAction(state1, GameActionEnum.SubmitGuess(), dictionaryEmpty, now);
      expect(state2.isInvalidGuess).toBe(true);
      expect(state2.wordleGuesses).toHaveLength(0);
    });

    it("does not mutate state when submitting an incomplete guess", () => {
      const state1 = { ...INITIAL_GAME_STATE, currentGuessWord: "APP" };
      const state2 = applyGameAction(state1, GameActionEnum.SubmitGuess(), dictionary, now);
      expect(state2).toBe(state1);
    });

    it("returns the same state reference after a terminal status", () => {
      const wonState = { ...INITIAL_GAME_STATE, theSecretWord: "APPLE", wordleGuesses: ["APPLE"], currentTurn: 2 };
      const nextState = applyGameAction(wonState, GameActionEnum.AddLetter({ letter: "A" }), dictionary, now);
      expect(nextState).toBe(wonState);
    });
  });

  describe("deriveGameEvent", () => {
    const now = DateTime.unsafeMake(0);

    it("emits WordWon when a playing state transitions to won", () => {
      const prevState = { ...INITIAL_GAME_STATE, theSecretWord: "APPLE", currentGuessWord: "APPLE" };
      const nextState = { ...prevState, currentGuessWord: "", wordleGuesses: ["APPLE"], currentTurn: 2 };
      const event = deriveGameEvent(prevState, nextState, now);

      expect(Option.isSome(event)).toBe(true);
      if (Option.isSome(event)) expect(event.value._tag).toBe("WordWon");
    });

    it("emits WordLost when a playing state transitions past the final turn", () => {
      const prevState = { ...INITIAL_GAME_STATE, theSecretWord: "APPLE", currentTurn: 6 };
      const nextState = { ...prevState, wordleGuesses: ["BIRDS", "CARDS", "TABLE", "CHAIR", "HOUSE", "PIANO"], currentTurn: 7 };
      const event = deriveGameEvent(prevState, nextState, now);

      expect(Option.isSome(event)).toBe(true);
      if (Option.isSome(event)) expect(event.value._tag).toBe("WordLost");
    });

    it("does not emit an event while play continues", () => {
      const prevState = { ...INITIAL_GAME_STATE, theSecretWord: "APPLE", currentGuessWord: "BIRDS" };
      const nextState = { ...prevState, currentGuessWord: "", wordleGuesses: ["BIRDS"], currentTurn: 2 };
      expect(Option.isNone(deriveGameEvent(prevState, nextState, now))).toBe(true);
    });
  });

  describe("formatTime", () => {
    it.effect("formats time in mm:ss for durations under an hour", () =>
      Effect.gen(function* () {
        const start = yield* DateTime.now;
        yield* TestClock.adjust(Duration.sum(Duration.minutes(2), Duration.seconds(45)));
        const end = yield* DateTime.now;

        expect(formatDuration(DateTime.distanceDuration(start, end))).toBe("02:45");
      })
    );

    it.effect("formats time in HH:mm:ss for durations over an hour", () =>
      Effect.gen(function* () {
        const start = yield* DateTime.now;
        const oneHourFiveMinsTenSecs = Duration.sum(Duration.hours(1), Duration.sum(Duration.minutes(5), Duration.seconds(10)));
        yield* TestClock.adjust(oneHourFiveMinsTenSecs);
        const end = yield* DateTime.now;

        expect(formatDuration(DateTime.distanceDuration(start, end))).toBe("01:05:10");
      })
    );

    it.effect("pads single digits with zeros", () =>
      Effect.gen(function* () {
        const start = yield* DateTime.now;
        yield* TestClock.adjust(Duration.seconds(5));
        const end = yield* DateTime.now;

        expect(formatDuration(DateTime.distanceDuration(start, end))).toBe("00:05");
      })
    );
  });
});

import { describe, expect, it } from "@effect/vitest";
import { Effect, DateTime, Duration, TestClock } from "effect";
import { calculateScore, formatDuration } from ".";

describe("gameLogic", () => {
  describe("calculateScore", () => {
    it.effect("calculates base points correctly for different turns", () =>
      Effect.gen(function* () {
        const start = yield* DateTime.now;
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
        const start = yield* DateTime.now;

        // < 30s: 1.5x
        yield* TestClock.adjust(Duration.seconds(20));
        const scoreFast = calculateScore(4, start, yield* DateTime.now);
        expect(scoreFast.speedMultiplier).toBe(1.5);
        expect(scoreFast.totalScore).toBe(600); // 400 * 1.5

        // < 60s: 1.2x
        // We are already at 20s, add 25s more to reach 45s
        yield* TestClock.adjust(Duration.seconds(25));
        const scoreMedium = calculateScore(4, start, yield* DateTime.now);
        expect(scoreMedium.speedMultiplier).toBe(1.2);
        expect(scoreMedium.totalScore).toBe(480); // 400 * 1.2

        // < 180s: 1.0x
        // We are at 45s, add 75s more to reach 120s
        yield* TestClock.adjust(Duration.seconds(75));
        const scoreSlow = calculateScore(4, start, yield* DateTime.now);
        expect(scoreSlow.speedMultiplier).toBe(1.0);
        expect(scoreSlow.totalScore).toBe(400); // 400 * 1.0

        // >= 180s: 0.8x
        // We are at 120s, add 80s more to reach 200s
        yield* TestClock.adjust(Duration.seconds(80));
        const scoreVerySlow = calculateScore(4, start, yield* DateTime.now);
        expect(scoreVerySlow.speedMultiplier).toBe(0.8);
        expect(scoreVerySlow.totalScore).toBe(320); // 400 * 0.8
      })
    );
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

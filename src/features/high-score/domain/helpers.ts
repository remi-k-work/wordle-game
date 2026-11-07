// services, features, and other libraries
import { Array, Option } from "effect";
import { calculatePotentialScore } from "@/features/game/domain/game-logic";
import { getBasePointsPerTurn, getSpeedMultiplier } from "@/features/game/domain/helpers";

// Compare a candidate run against the tail (last/10th) entry of the top-10 list
// A candidate beats the tail when its score is strictly higher, or tied with a
// strictly higher streak; `onNone` guards the empty-list case (callers short-
// circuit on `length < 10` before reaching here)
export const beatsTop10Tail = <T extends { score: number; streak: number }>(top10: ReadonlyArray<T>, score: number, streak: number) =>
  Option.exists(Array.last(top10), (tail) => score > tail.score || (score === tail.score && streak > tail.streak));

// A run qualifies for the Top 10 while the board is not full; once it is, it
// has to beat the 10th-place entry; single source of truth for the two places
// that ask this question: the high-score machine's pre-submission guard, and
// the DB service's re-check inside the serialized transaction
export const qualifiesForTop10 = <T extends { score: number; streak: number }>(top10: ReadonlyArray<T>, score: number, streak: number) =>
  top10.length < 10 || beatsTop10Tail(top10, score, streak);

// The score readings shared by both scoring-simulator modes, so the
// turn/time → score derivation can't drift between the interactive and the
// read-only report modes
// A plain derivation rather than a hook: it reads no React APIs, and naming it
// as one would only subject its callers to the rules-of-hooks constraints
// `gt` and `locale` deliberately stay out: they are context reads each mode
// needs for its own labels/formatting, not score readings, and taking them here
// would only push them back out through the return value
export const getScoreReadings = (guessedTurn: number, timeElapsed: number) => ({
  potentialScore: calculatePotentialScore(guessedTurn, timeElapsed),
  basePointsPerTurn: getBasePointsPerTurn(guessedTurn),
  speedMultiplier: getSpeedMultiplier(timeElapsed),
});

// The three numbers every part of the simulator shows. `SimulatorBody` derives
// them once and hands them to the sections (and the formula footer) that
// display them, so no second component re-derives the same readings from the
// raw inputs — one owner of the score formula, however many places show it
export type ScoreReadings = ReturnType<typeof getScoreReadings>;

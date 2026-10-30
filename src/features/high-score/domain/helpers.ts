// services, features, and other libraries
import { Array, Option } from "effect";

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

// services, features, and other libraries
import { Array, Option } from "effect";

// Compare a candidate run against the tail (last/10th) entry of the top-10 list.
// A candidate beats the tail when its score is strictly higher, or tied with a
// strictly higher streak. `onNone` guards the empty-list case (callers short-
// circuit on `length < 10` before reaching here).
export const beatsTop10Tail = <T extends { score: number; streak: number }>(top10: ReadonlyArray<T>, score: number, streak: number): boolean =>
  Option.match(Array.last(top10), {
    onNone: () => false,
    onSome: (tail) => score > tail.score || (score === tail.score && streak > tail.streak),
  });

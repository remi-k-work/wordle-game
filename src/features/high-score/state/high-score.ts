// services, features, and other libraries
import { Effect, Option } from "effect";
import { Atom, Result } from "@effect-atom/atom-react";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";
import { qualifiesForHighScore } from "@/features/high-score/domain";
import { lastRunScoreAtom, lastStreakAtom } from "@/features/game/state";

// types
import type { AddHighScore } from "@/features/high-score/domain";

// Reactive atom for the top 10 high scores
export const top10HighScoresAtom = RuntimeAtom.atom(
  Effect.gen(function* () {
    const { top10HighScores } = yield* RpcHighScoreClient;
    return yield* top10HighScores();
  })
);

// Action atom for adding a new high score
export const addHighScoreAction = RuntimeAtom.fn(
  Effect.fnUntraced(function* (newHighScore: AddHighScore) {
    const { addHighScore } = yield* RpcHighScoreClient;
    yield* addHighScore(newHighScore);
  })
);

// Derived atom to determine if the current run qualifies for the high score
export const qualifiesForHighScoreAtom = Atom.make((get) => {
  const top10HighScores = get(top10HighScoresAtom);
  const lastRunScore = get(lastRunScoreAtom);
  const lastStreak = get(lastStreakAtom);

  // If we do not have a successful fetch yet, we cannot determine qualification
  return Option.match(Result.value(top10HighScores), {
    onNone: () => false,
    onSome: (top10HighScores) => qualifiesForHighScore(top10HighScores, lastRunScore, lastStreak),
  });
});

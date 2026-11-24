// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Option, Ref } from "effect";
import { HighScoreDB, HighScoreDBTestRef } from "@/features/high-score/services/high-score-db";
import { HighScoreEntry } from "@/features/high-score/domain/models";
import { AddNewHighScore } from "@/features/high-score/machines/high-score/models";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// The in-memory layer must mirror the live SQL's contract (ordering, the
// top-10 cap, the per-language filter and the `qualifiesForTop10` re-check), so
// these tests drive it through the service surface, not the internals.

const entry = (id: number, score: number, streak: number, solutionsLang: SolutionsLanguage = "En") =>
  new HighScoreEntry({ id, playerName: "AAA", score, streak, solutionsLang, createdAt: DateTime.makeUnsafe(0) });

const request = (score: number, streak: number, solutionsLang: SolutionsLanguage = "En") =>
  new AddNewHighScore({ playerName: "ABC", score, streak, solutionsLang });

describe("HighScoreDB.layerTest", () => {
  it.effect("orders a language's board by score, then by streak, and excludes other languages", () =>
    Effect.gen(function* () {
      const store = yield* HighScoreDBTestRef;
      yield* Ref.set(store, [entry(1, 10, 1), entry(2, 30, 1), entry(3, 30, 5), entry(4, 20, 9), entry(5, 50, 0, "Pl")]);

      const db = yield* HighScoreDB;
      const top10 = yield* db.top10HighScores("En");

      expect(top10.map((highScore) => highScore.id)).toEqual([3, 2, 4, 1]);
    }).pipe(Effect.provide(HighScoreDB.layerTest))
  );

  it.effect("caps the board at ten entries", () =>
    Effect.gen(function* () {
      const store = yield* HighScoreDBTestRef;
      yield* Ref.set(
        store,
        Array.from({ length: 12 }, (_unused, index) => entry(index + 1, index + 1, 0))
      );

      const db = yield* HighScoreDB;
      const top10 = yield* db.top10HighScores("En");

      expect(top10.map((highScore) => highScore.id)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
    }).pipe(Effect.provide(HighScoreDB.layerTest))
  );

  it.effect("assigns the next id and records a submission that beats the full board", () =>
    Effect.gen(function* () {
      const store = yield* HighScoreDBTestRef;
      yield* Ref.set(
        store,
        Array.from({ length: 10 }, (_unused, index) => entry(index + 1, 100 - index, 0))
      );

      const db = yield* HighScoreDB;
      const id = yield* db.addNewHighScore(request(92, 0));

      expect(id).toStrictEqual(Option.some(11));
      const records = yield* Ref.get(store);
      expect(records).toHaveLength(11);
      expect(records.at(-1)).toMatchObject({ id: 11, score: 92 });
    }).pipe(Effect.provide(HighScoreDB.layerTest))
  );

  it.effect("returns none when a full board does not yield to the submission", () =>
    Effect.gen(function* () {
      const store = yield* HighScoreDBTestRef;
      yield* Ref.set(
        store,
        Array.from({ length: 10 }, (_unused, index) => entry(index + 1, 100 - index, 0))
      );

      const db = yield* HighScoreDB;
      const id = yield* db.addNewHighScore(request(90, 0));

      expect(id).toStrictEqual(Option.none());
      expect(yield* Ref.get(store)).toHaveLength(10);
    }).pipe(Effect.provide(HighScoreDB.layerTest))
  );

  it.effect("admits any score while the board is not yet full", () =>
    Effect.gen(function* () {
      const db = yield* HighScoreDB;
      const id = yield* db.addNewHighScore(request(1, 0));

      expect(id).toStrictEqual(Option.some(1));
    }).pipe(Effect.provide(HighScoreDB.layerTest))
  );
});

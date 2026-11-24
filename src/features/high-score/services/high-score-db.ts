// services, features, and other libraries
import { Array, Context, DateTime, Effect, Layer, Option, Ref, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { HighScoreEntry } from "@/features/high-score/domain/models";
import { AddNewHighScore } from "@/features/high-score/machines/high-score/models";
import { qualifiesForTop10 } from "@/features/high-score/domain/helpers";
import { SolutionsLanguage } from "@/features/game/domain/models";
import { dieOnDbFailure } from "@/domain/helpers";

// The ordering rule the SQL uses (`ORDER BY score DESC, streak DESC LIMIT 10`),
// shared by the test layer's read and its qualification re-check.
const top10ForLanguage = (entries: ReadonlyArray<HighScoreEntry>, solutionsLanguage: SolutionsLanguage) =>
  entries
    .filter((entry) => entry.solutionsLang === solutionsLanguage)
    .sort((a, b) => b.score - a.score || b.streak - a.streak)
    .slice(0, 10);

// Test-only: the mutable store behind `HighScoreDB.layerTest`, exposed so tests
// can seed and inspect the board directly (the docs' test-ref pattern).
export class HighScoreDBTestRef extends Context.Service<HighScoreDBTestRef, Ref.Ref<Array<HighScoreEntry>>>()("HighScoreDBTestRef") {
  static readonly layer = Layer.effect(HighScoreDBTestRef, Ref.make(Array.empty<HighScoreEntry>()));
}

export class HighScoreDB extends Context.Service<
  HighScoreDB,
  {
    readonly top10HighScores: (solutionsLanguage: SolutionsLanguage) => Effect.Effect<ReadonlyArray<HighScoreEntry>>;
    readonly addNewHighScore: (request: AddNewHighScore) => Effect.Effect<Option.Option<HighScoreEntry["id"]>>;
  }
>()("HighScoreDB") {
  // Like TelemetryDB/ChartsDB, the service only requires SqlClient.SqlClient —
  // the production driver (PgLive) is provided at composition time, keeping the
  // service injectable with a test container
  static readonly layer = Layer.effect(
    HighScoreDB,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const top10HighScoresQuery = SqlSchema.findAll({
        Request: SolutionsLanguage,
        Result: HighScoreEntry,
        execute: (solutionsLanguage) =>
          sql`SELECT id, player_name, score, streak, solutions_lang, created_at FROM high_score WHERE solutions_lang = ${solutionsLanguage} ORDER BY score DESC, streak DESC LIMIT 10`,
      });

      const addNewHighScoreQuery = SqlSchema.findOne({
        Request: AddNewHighScore,
        Result: Schema.Struct({ id: HighScoreEntry.fields.id }),
        execute: (request) => sql`INSERT INTO high_score ${sql.insert(request)} RETURNING id`,
      });

      return HighScoreDB.of({
        top10HighScores: (solutionsLanguage: SolutionsLanguage) => dieOnDbFailure(top10HighScoresQuery(solutionsLanguage)),
        addNewHighScore: (request: AddNewHighScore) =>
          sql
            .withTransaction(
              Effect.gen(function* () {
                // Serialize qualification and insertion so two simultaneous submissions cannot both claim the same final slot.
                yield* sql`LOCK TABLE high_score IN SHARE ROW EXCLUSIVE MODE`;
                const currentTop10 = yield* top10HighScoresQuery(request.solutionsLang);
                if (!qualifiesForTop10(currentTop10, request.score, request.streak)) return Option.none();

                const { id } = yield* addNewHighScoreQuery(request);
                return Option.some(id);
              })
            )
            .pipe(dieOnDbFailure),
      });
    })
  );

  // Test-only: an in-memory implementation with the same contract — the same
  // ordering, the same `qualifiesForTop10` re-check, and ids allocated by the
  // store — so handler and machine tests need no database.
  static readonly layerTest = Layer.effect(
    HighScoreDB,
    Effect.gen(function* () {
      const store = yield* HighScoreDBTestRef;

      const top10HighScores = Effect.fn("HighScoreDB.top10HighScores")(function* (solutionsLanguage: SolutionsLanguage) {
        return top10ForLanguage(yield* Ref.get(store), solutionsLanguage);
      });

      const addNewHighScore = Effect.fn("HighScoreDB.addNewHighScore")(function* (request: AddNewHighScore) {
        const entries = yield* Ref.get(store);
        if (!qualifiesForTop10(top10ForLanguage(entries, request.solutionsLang), request.score, request.streak)) return Option.none();

        const id = entries.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
        const entry = new HighScoreEntry({
          id,
          playerName: request.playerName,
          score: request.score,
          streak: request.streak,
          solutionsLang: request.solutionsLang,
          // A fixed timestamp keeps the test layer deterministic (the live layer
          // lets the column's `NOW()` default fill `created_at`)
          createdAt: DateTime.makeUnsafe(0),
        });
        yield* Ref.set(store, [...entries, entry]);
        return Option.some(id);
      });

      return HighScoreDB.of({ top10HighScores, addNewHighScore });
    })
  ).pipe(Layer.provideMerge(HighScoreDBTestRef.layer));
}

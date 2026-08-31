// services, features, and other libraries
import { Context, Effect, Layer, Option, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/unstable/sql";
import { HighScore, AddHighScore, beatsTop10Tail } from "@/features/high-score/domain";
import { SolutionsLanguage } from "@/features/game/domain";
import { PgLive } from "@/lib/pg-live";
import { dieOnDbFailure } from "@/lib/db";

export class HighScoreDB extends Context.Service<HighScoreDB>()("HighScoreDB", {
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const top10HighScores = SqlSchema.findAll({
      Request: SolutionsLanguage,
      Result: HighScore,
      execute: (solutionsLanguage) =>
        sql`SELECT id, player_name, score, streak, solutions_lang, created_at FROM high_score WHERE solutions_lang = ${solutionsLanguage} ORDER BY score DESC, streak DESC LIMIT 10`,
    });

    const addHighScore = SqlSchema.findOne({
      Request: AddHighScore,
      Result: Schema.Struct({ id: HighScore.fields.id }),
      execute: (request) => sql`INSERT INTO high_score ${sql.insert(request)} RETURNING id`,
    });

    return {
      top10HighScores: (solutionsLanguage: SolutionsLanguage) => dieOnDbFailure(top10HighScores(solutionsLanguage)),
      addHighScore: (request: AddHighScore) =>
        sql
          .withTransaction(
            Effect.gen(function* () {
              // Serialize qualification and insertion so two simultaneous submissions cannot both claim the same final slot.
              yield* sql`LOCK TABLE high_score IN SHARE ROW EXCLUSIVE MODE`;
              const currentTop10 = yield* top10HighScores(request.solutionsLang);
              const qualifies = currentTop10.length < 10 || beatsTop10Tail(currentTop10, request.score, request.streak);
              if (!qualifies) return Option.none();

              const { id } = yield* addHighScore(request);
              return Option.some(id);
            })
          )
          .pipe(dieOnDbFailure),
    } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(PgLive));
}

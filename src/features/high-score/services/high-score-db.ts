// services, features, and other libraries
import { Context, Effect, Layer, Option, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { HighScoreEntry } from "@/features/high-score/domain/models";
import { AddNewHighScore } from "@/features/high-score/machines/high-score/models";
import { qualifiesForTop10 } from "@/features/high-score/domain/helpers";
import { SolutionsLanguage } from "@/features/game/domain/models";
import { dieOnDbFailure } from "@/domain/helpers";

export class HighScoreDB extends Context.Service<HighScoreDB>()("HighScoreDB", {
  make: Effect.gen(function* () {
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

    return {
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
    } as const;
  }),
}) {
  // Like TelemetryDB/ChartsDB, the service only requires SqlClient.SqlClient —
  // the production driver (PgLive) is provided at composition time, keeping the
  // service injectable with a test container
  static readonly layer = Layer.effect(this, this.make);
}

// services, features, and other libraries
import { Effect, Schema } from "effect";
import { SqlClient, SqlSchema } from "@effect/sql";
import { HighScoreSchema, AddHighScoreSchema } from "@/domain";
import { PgLive } from "@/lib/PgLive";

// types
import type { AddHighScore } from "@/domain";

export class HighScoreDB extends Effect.Service<HighScoreDB>()("HighScoreDB", {
  dependencies: [PgLive],

  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const top10HighScores = SqlSchema.findAll({
      Request: Schema.Void,
      Result: HighScoreSchema,
      execute: () => sql`SELECT player_name, score, streak, solutions_lang, created_at FROM high_score ORDER BY score DESC, streak DESC LIMIT 10`,
    });

    const addHighScore = SqlSchema.void({ Request: AddHighScoreSchema, execute: (request) => sql`INSERT INTO high_score ${sql.insert(request)}` });

    return {
      top10HighScores: top10HighScores().pipe(Effect.tapError(Effect.logError), Effect.catchTags({ ParseError: Effect.die, SqlError: Effect.die })),
      addHighScore: (request: AddHighScore) =>
        addHighScore(request).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ ParseError: Effect.die, SqlError: Effect.die })),
    } as const;
  }),
}) {}

// services, features, and other libraries
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import { GuessDistributionArgs, GuessDistributionData, TimeToSolveDistributionArgs, TimeToSolveDistributionData } from "@/features/telemetry/domain";
import { PgLive } from "@/lib/pg-live";
import { guessDistributionQuery, timeToSolveDistributionQuery } from "./queries";
import { cumulativeToDistribution } from ".";

export class ChartsDB extends Context.Service<ChartsDB>()("ChartsDB", {
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const getGuessDistribution = ({ sessionId, solutionsLanguage }: GuessDistributionArgs) =>
      Effect.gen(function* () {
        const rows = yield* guessDistributionQuery(sql, { sessionId, solutionsLanguage });

        // Coerce strings from DB into numbers
        const safeRows = rows.map((row) => ({ turn: Number(row.turn), personal: Number(row.personal), global: Number(row.global) }));

        const chartData = cumulativeToDistribution(safeRows, (row, personal, global, personalPct, globalPct) => ({
          turn: row.turn,
          personal,
          global,
          personalPct,
          globalPct,
        }));

        // Decode against the strict schema, as recommended for final domain mapping
        return yield* Schema.decodeUnknownEffect(GuessDistributionData)(chartData);
      }).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));

    const getTimeToSolveDistribution = ({ sessionId, solutionsLanguage }: TimeToSolveDistributionArgs) =>
      Effect.gen(function* () {
        const rows = yield* timeToSolveDistributionQuery(sql, { sessionId, solutionsLanguage });

        // Coerce strings from DB into numbers
        const safeRows = rows.map((row) => ({
          maxSeconds: row.maxSeconds !== null ? Number(row.maxSeconds) : null,
          personal: Number(row.personal),
          global: Number(row.global),
        }));

        const chartData = cumulativeToDistribution(safeRows, (row, personal, global, personalPct, globalPct) => ({
          maxSeconds: row.maxSeconds,
          personal,
          global,
          personalPct,
          globalPct,
        }));

        // Decode against the strict schema, as recommended for final domain mapping
        return yield* Schema.decodeUnknownEffect(TimeToSolveDistributionData)(chartData);
      }).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));

    return { getGuessDistribution, getTimeToSolveDistribution } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(PgLive));
}

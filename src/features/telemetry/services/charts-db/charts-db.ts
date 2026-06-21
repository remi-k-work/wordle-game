// services, features, and other libraries
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/unstable/sql";
import {
  AnyCounterArgs,
  anyCounterQuery,
  ArcadeStreakDistributionArgs,
  ArcadeStreakDistributionData,
  arcadeStreakDistributionQuery,
  cumulativeToDistribution,
  FailedWordsFrequencyArgs,
  failedWordsFrequencyQuery,
  GuessDistributionArgs,
  GuessDistributionData,
  guessDistributionQuery,
  OpeningGuessesFrequencyArgs,
  openingGuessesFrequencyQuery,
  RunDeathReasonFrequencyArgs,
  runDeathReasonFrequencyQuery,
  TimeToSolveDistributionArgs,
  TimeToSolveDistributionData,
  timeToSolveDistributionQuery,
} from ".";
import { PgLive } from "@/lib/pg-live";

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

    const getArcadeStreakDistribution = ({ sessionId, solutionsLanguage }: ArcadeStreakDistributionArgs) =>
      Effect.gen(function* () {
        const rows = yield* arcadeStreakDistributionQuery(sql, { sessionId, solutionsLanguage });

        // Coerce strings from DB into numbers
        const safeRows = rows.map((row) => ({
          streak: row.streak !== null ? Number(row.streak) : null,
          personal: Number(row.personal),
          global: Number(row.global),
        }));

        const chartData = cumulativeToDistribution(safeRows, (row, personal, global, personalPct, globalPct) => ({
          streak: row.streak,
          personal,
          global,
          personalPct,
          globalPct,
        }));

        // Decode against the strict schema, as recommended for final domain mapping
        return yield* Schema.decodeUnknownEffect(ArcadeStreakDistributionData)(chartData);
      }).pipe(Effect.tapError(Effect.logError), Effect.catchTags({ SchemaError: Effect.die, SqlError: Effect.die }));

    const getOpeningGuessesFrequency = openingGuessesFrequencyQuery(sql);
    const getFailedWordsFrequency = failedWordsFrequencyQuery(sql);
    const getRunDeathReasonFrequency = runDeathReasonFrequencyQuery(sql);
    const getAnyCounter = anyCounterQuery(sql);

    return {
      getGuessDistribution,
      getTimeToSolveDistribution,
      getArcadeStreakDistribution,
      getOpeningGuessesFrequency: (request: OpeningGuessesFrequencyArgs) => getOpeningGuessesFrequency(request),
      getFailedWordsFrequency: (request: FailedWordsFrequencyArgs) => getFailedWordsFrequency(request),
      getRunDeathReasonFrequency: (request: RunDeathReasonFrequencyArgs) => getRunDeathReasonFrequency(request),
      getAnyCounter: (request: AnyCounterArgs) => getAnyCounter(request),
    } as const;
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(PgLive));
}

import "server-only";

// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcTelemetry } from "./requests";
import { TelemetryDB } from "@/features/telemetry/services/telemetry-db";
import { ChartsDB } from "@/features/telemetry/services/charts-db/charts-db";
import { PgLive } from "@/lib/pg-live";
import { makeRpcHandler } from "@/domain/helpers";

const RpcTelemetryLayer = RpcTelemetry.toLayer({
  addGlobalPulse: (payload) =>
    Effect.gen(function* () {
      const telemetryDB = yield* TelemetryDB;
      yield* telemetryDB.addGlobalPulse(payload);
    }),

  addArcadeRunSummary: (payload) =>
    Effect.gen(function* () {
      const telemetryDB = yield* TelemetryDB;
      yield* telemetryDB.addArcadeRunSummary(payload);
    }),

  addRunWordEvent: (payload) =>
    Effect.gen(function* () {
      const telemetryDB = yield* TelemetryDB;
      yield* telemetryDB.addRunWordEvent(payload);
    }),

  getGuessDistribution: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getGuessDistribution(payload);
    }),

  getTimeToSolveDistribution: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getTimeToSolveDistribution(payload);
    }),

  getArcadeStreakDistribution: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getArcadeStreakDistribution(payload);
    }),

  getOpeningGuessesFrequency: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getOpeningGuessesFrequency(payload);
    }),

  getFailedWordsFrequency: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getFailedWordsFrequency(payload);
    }),

  getRunDeathReasonFrequency: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getRunDeathReasonFrequency(payload);
    }),

  getAnyCounter: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getAnyCounter(payload);
    }),

  getAnyAvgStat: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getAnyAvgStat(payload);
    }),

  getHardestWordsLeaderboard: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getHardestWordsLeaderboard(payload);
    }),

  getBestRunTrophyCard: (payload) =>
    Effect.gen(function* () {
      const chartsDB = yield* ChartsDB;
      return yield* chartsDB.getBestRunTrophyCard(payload);
    }),
}).pipe(Layer.provide(Layer.mergeAll(TelemetryDB.layer, ChartsDB.layer).pipe(Layer.provide(PgLive))));

export const handler = makeRpcHandler(RpcTelemetry, "/api/rpc/telemetry", RpcTelemetryLayer);

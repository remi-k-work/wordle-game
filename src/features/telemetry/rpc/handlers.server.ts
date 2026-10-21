// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcTelemetry } from "./requests";
import { TelemetryDB } from "@/features/telemetry/services/telemetry-db";
import { ChartsDB } from "@/features/telemetry/services/charts-db/charts-db";
import { PgLive } from "@/lib/pg.server";
import { makeRpcHandler } from "@/domain/helpers.server";

// Every handler is a pass-through to the same DB service method, so the
// service lookups are hoisted once and the handlers delegate point-free
const telemetryDB = Effect.service(TelemetryDB);
const chartsDB = Effect.service(ChartsDB);

const RpcTelemetryLayer = RpcTelemetry.toLayer({
  addGlobalPulse: (payload) => Effect.flatMap(telemetryDB, (db) => db.addGlobalPulse(payload)),
  addArcadeRunSummary: (payload) => Effect.flatMap(telemetryDB, (db) => db.addArcadeRunSummary(payload)),
  addRunWordEvent: (payload) => Effect.flatMap(telemetryDB, (db) => db.addRunWordEvent(payload)),
  getGuessDistribution: (payload) => Effect.flatMap(chartsDB, (db) => db.getGuessDistribution(payload)),
  getTimeToSolveDistribution: (payload) => Effect.flatMap(chartsDB, (db) => db.getTimeToSolveDistribution(payload)),
  getArcadeStreakDistribution: (payload) => Effect.flatMap(chartsDB, (db) => db.getArcadeStreakDistribution(payload)),
  getOpeningGuessesFrequency: (payload) => Effect.flatMap(chartsDB, (db) => db.getOpeningGuessesFrequency(payload)),
  getFailedWordsFrequency: (payload) => Effect.flatMap(chartsDB, (db) => db.getFailedWordsFrequency(payload)),
  getRunDeathReasonFrequency: (payload) => Effect.flatMap(chartsDB, (db) => db.getRunDeathReasonFrequency(payload)),
  getAnyCounter: (payload) => Effect.flatMap(chartsDB, (db) => db.getAnyCounter(payload)),
  getAnyAvgStat: (payload) => Effect.flatMap(chartsDB, (db) => db.getAnyAvgStat(payload)),
  getHardestWordsLeaderboard: (payload) => Effect.flatMap(chartsDB, (db) => db.getHardestWordsLeaderboard(payload)),
  getBestRunTrophyCard: (payload) => Effect.flatMap(chartsDB, (db) => db.getBestRunTrophyCard(payload)),
}).pipe(Layer.provide(Layer.mergeAll(TelemetryDB.layer, ChartsDB.layer).pipe(Layer.provide(PgLive))));

export const handler = makeRpcHandler(RpcTelemetry, "/api/rpc/telemetry", RpcTelemetryLayer);

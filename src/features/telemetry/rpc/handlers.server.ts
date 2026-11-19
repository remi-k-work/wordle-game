// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcTelemetry } from "./requests";
import { TelemetryDB } from "@/features/telemetry/services/telemetry-db";
import { ChartsDB } from "@/features/charts/services/charts-db";
import { PgLive } from "@/lib/pg.server";
import { makeRpcHandler } from "@/domain/helpers.server";

// constants
import { RPC_TELEMETRY_PATH } from "@/domain/constants";

// Every handler is a pass-through to the same DB service method
const RpcTelemetryLayer = RpcTelemetry.toLayer({
  addGlobalPulse: (payload) => Effect.flatMap(TelemetryDB, (db) => db.addGlobalPulse(payload)),
  addArcadeRunSummary: (payload) => Effect.flatMap(TelemetryDB, (db) => db.addArcadeRunSummary(payload)),
  addRunWordEvent: (payload) => Effect.flatMap(TelemetryDB, (db) => db.addRunWordEvent(payload)),
  getGuessDistribution: (payload) => Effect.flatMap(ChartsDB, (db) => db.getGuessDistribution(payload)),
  getTimeToSolveDistribution: (payload) => Effect.flatMap(ChartsDB, (db) => db.getTimeToSolveDistribution(payload)),
  getArcadeStreakDistribution: (payload) => Effect.flatMap(ChartsDB, (db) => db.getArcadeStreakDistribution(payload)),
  getOpeningGuessesFrequency: (payload) => Effect.flatMap(ChartsDB, (db) => db.getOpeningGuessesFrequency(payload)),
  getFailedWordsFrequency: (payload) => Effect.flatMap(ChartsDB, (db) => db.getFailedWordsFrequency(payload)),
  getRunDeathReasonFrequency: (payload) => Effect.flatMap(ChartsDB, (db) => db.getRunDeathReasonFrequency(payload)),
  getAnyCounter: (payload) => Effect.flatMap(ChartsDB, (db) => db.getAnyCounter(payload)),
  getAnyAvgStat: (payload) => Effect.flatMap(ChartsDB, (db) => db.getAnyAvgStat(payload)),
  getHardestWordsLeaderboard: (payload) => Effect.flatMap(ChartsDB, (db) => db.getHardestWordsLeaderboard(payload)),
  getBestRunTrophyCard: (payload) => Effect.flatMap(ChartsDB, (db) => db.getBestRunTrophyCard(payload)),
  // `provide` (not `provideMerge`) is deliberate: makeRpcHandler must claim only the Rpc.ToHandler output, never the DB services themselves
}).pipe(Layer.provide(Layer.mergeAll(TelemetryDB.layer, ChartsDB.layer).pipe(Layer.provide(PgLive))));

export const handler = makeRpcHandler(RpcTelemetry, RPC_TELEMETRY_PATH, RpcTelemetryLayer);

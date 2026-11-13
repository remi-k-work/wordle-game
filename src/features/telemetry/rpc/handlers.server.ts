// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcTelemetry } from "./requests";
import { TelemetryDB } from "@/features/telemetry/services/telemetry-db";
import { ChartsDB } from "@/features/charts/services/charts-db";
import { PgLive } from "@/lib/pg.server";
import { makeRpcHandler } from "@/domain/helpers.server";

// constants
import { RPC_TELEMETRY_PATH } from "@/domain/constants";

// Every handler is a pass-through to the same DB service method, so the service
// lookups are hoisted once and the handlers delegate point-free — the same shape
// high-score/rpc/handlers.server.ts uses (one `Effect.service` per service, not
// one per handler)
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
  // `provide` (not `provideMerge`) is deliberate: makeRpcHandler must claim only the
  // Rpc.ToHandler output, never the DB services themselves
}).pipe(Layer.provide(Layer.mergeAll(TelemetryDB.layer, ChartsDB.layer).pipe(Layer.provide(PgLive))));

export const handler = makeRpcHandler(RpcTelemetry, RPC_TELEMETRY_PATH, RpcTelemetryLayer);

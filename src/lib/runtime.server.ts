// services, features, and other libraries
import { Layer, Logger, ManagedRuntime } from "effect";
import { SyncScheduler } from "@/lib/sync-scheduler";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";
import { PgLive } from "@/lib/pg.server";

// The sync scheduler is required on workerd: the default async scheduler's
// setImmediate timers are owned by the request that first scheduled them, so
// fibers of later requests die with an AsyncLocalStorage error; defined once in
// @/lib/sync-scheduler and shared with domain/helpers.server.ts (the per-request
// RPC handler) so both stay in sync

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), HighScoreDB.layer, SyncScheduler).pipe(Layer.provide(PgLive));

// The services a server page-main may require: exactly what RuntimeServer provides
export type ServerMainServices = Layer.Success<typeof MainLayer>;

export const RuntimeServer = ManagedRuntime.make(MainLayer);

// services, features, and other libraries
import { Layer, Logger, ManagedRuntime, Scheduler } from "effect";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";
import { PgLive } from "@/lib/pg.server";

// The sync scheduler is required on workerd: the default async scheduler's
// setImmediate timers are owned by the request that first scheduled them, so
// fibers of later requests die with an AsyncLocalStorage error (see the comment
// on SyncScheduler in domain/helpers.server.ts)
const SyncScheduler = Layer.succeed(Scheduler.Scheduler, new Scheduler.MixedScheduler("sync"));

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), HighScoreDB.layer, SyncScheduler).pipe(Layer.provide(PgLive));

// The services a server page-main may require: exactly what RuntimeServer provides
export type ServerMainServices = Layer.Success<typeof MainLayer>;

export const RuntimeServer = ManagedRuntime.make(MainLayer);

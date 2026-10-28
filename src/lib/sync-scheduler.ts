// services, features, and other libraries
import { Layer, Scheduler } from "effect";

// The sync scheduler is required on workerd: the default async scheduler's
// setImmediate timers are owned by the request that first scheduled them, so
// fibers of later requests die with an AsyncLocalStorage error (see the comment
// on SyncScheduler in domain/helpers.server.ts); the sync scheduler dispatches
// via microtasks, which are not request-owned
//
// Shared single source of truth so the per-request RPC handler
// (domain/helpers.server.ts) and the server ManagedRuntime (lib/runtime.server.ts)
// stay in sync instead of drifting apart
export const SyncScheduler = Layer.succeed(Scheduler.Scheduler, new Scheduler.MixedScheduler("sync"));

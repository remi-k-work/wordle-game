// services, features, and other libraries
import { Layer, Scheduler } from "effect";

// Bunch of "Top Recommended" Polish voices
export const VOICES_PL = [
  "4f63d293e42d4ec9adf3d9ab1ad2652c",
  "2532d01f4c59446d9e2144803b73e9da",
  "1809e47873bf4dbd888e7bbd4a3e5a40",
  "c0c73f79cd234d3ba0e9a5aadf20561e",
  "cddbb44570724e149ce890c648f96cef",
  "adae31735e2d4779836301ad608df536",
  "ae1b267676c64e37b70af1871f2aa73f",
  "d61da2c99cfe4adc9f576d0c854fa488",
  "ca91b09b8de94a33b95e263ae1a181ac",
  "0aca6e0c21f343789ba4f41038d9110c",
] as const;

// Detects Cloudflare Workers runtime; browser and Node both lack this navigator value
// Shared between pg-config.ts and helpers.server.ts to keep the detection in one place
export const IS_WORKERD = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

// The sync scheduler is required on workerd: the default async scheduler's
// setImmediate timers are owned by the request that first scheduled them, so
// fibers of later requests die with an AsyncLocalStorage error (see the comment
// on SyncScheduler in domain/helpers.server.ts); the sync scheduler dispatches
// via microtasks, which are not request-owned
//
// Shared single source of truth so the per-request RPC handler
// (domain/helpers.server.ts) and the server ManagedRuntime (lib/runtime.server.ts)
// stay in sync instead of drifting apart
export const SYNC_SCHEDULER_LAYER = Layer.succeed(Scheduler.Scheduler, new Scheduler.MixedScheduler("sync"));

export const RPC_GAME_PATH = "/api/rpc/game";
export const RPC_HIGH_SCORE_PATH = "/api/rpc/high-score";
export const RPC_OVERDRIVE_HACKS_PATH = "/api/rpc/overdrive-hacks";
export const RPC_TELEMETRY_PATH = "/api/rpc/telemetry";

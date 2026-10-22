// services, features, and other libraries
import { Layer, Redacted, String } from "effect";
import { PgClient } from "@effect/sql-pg";
import { env } from "cloudflare:workers";

export const pgConfig: PgClient.PgPoolConfig = { transformQueryNames: String.camelToSnake, transformResultNames: String.snakeToCamel, transformJson: true };

// workerd destroys the TCP sockets a request created when that request ends, so
// a pooled connection can never be reused across requests: the second use
// writes into a dead socket and hangs forever without surfacing an error, until
// the runtime cancels the request (dev: miniflare 500 "code had hung and would
// never generate a response"; prod: request freeze). Effect PgPool's escape
// hatch: "a TTL of zero disables reuse", making every checkout open a fresh
// connection and close the previous one. Node contexts (migration runner,
// probes) have healthy long-lived sockets, so pool reuse stays on there.
// NOTE: cross-request fiber scheduling is fixed separately via the sync
// scheduler (see domain/helpers.server.ts) — both fixes are required
const isWorkerd = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

export const makePgClientLayer = PgClient.layer({
  ...pgConfig,
  url: Redacted.make(env.HYPERDRIVE.connectionString),
  idleTimeout: "10 seconds",
  connectTimeout: "10 seconds",
  ...(isWorkerd ? { connectionTTL: "0 seconds" as const } : {}),
});

export const PgLive = makePgClientLayer.pipe(Layer.orDie);

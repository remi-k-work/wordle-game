// services, features, and other libraries
import { Config, Effect, Layer, Redacted, String } from "effect";
import { PgClient } from "@effect/sql-pg";

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

export const makePgClientLayer = (databaseUrl: Redacted.Redacted<string>, ssl: boolean | object) =>
  PgClient.layer({
    ...pgConfig,
    url: databaseUrl,
    // ssl,
    idleTimeout: "10 seconds",
    connectTimeout: "10 seconds",
    ...(isWorkerd ? { connectionTTL: "0 seconds" as const } : {}),
  });

// Resolves the connection options shared by the live client layer and the migration runner:
// `ENV` drives SSL, `DATABASE_URL` is always read from the redacted config
export const connectConfig = Effect.gen(function* () {
  const env = yield* Config.Literal("local", "ENV").pipe(Config.orElse(() => Config.succeed("prod" as const)));
  const ssl = env !== "local" ? { rejectUnauthorized: false } : false;
  const databaseUrl = yield* Config.Redacted("DATABASE_URL");

  return { databaseUrl, ssl };
});

export const PgLive = Layer.unwrap(
  Effect.gen(function* () {
    const { databaseUrl, ssl } = yield* connectConfig;
    return makePgClientLayer(databaseUrl, ssl);
  })
).pipe(Layer.orDie);

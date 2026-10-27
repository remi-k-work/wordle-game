// services, features, and other libraries
import { Redacted, String } from "effect";
import { PgClient } from "@effect/sql-pg";
import { isWorkerd } from "./is-workerd";

// This module is deliberately free of `cloudflare:workers`: pgConfig and makePgClientLayer are
// shared by the worker (see pg.server.ts), the migration runner (seed/run-migrations.ts) and the
// test suites, all of which run in Node, where the `cloudflare:workers` specifier cannot be
// resolved (ERR_UNSUPPORTED_ESM_URL_SCHEME). Only pg.server.ts may read env.HYPERDRIVE
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

export const makePgClientLayer = (url: Redacted.Redacted<string>) =>
  PgClient.layer({ ...pgConfig, url, idleTimeout: "10 seconds", connectTimeout: "10 seconds", ...(isWorkerd ? { connectionTTL: "0 seconds" as const } : {}) });

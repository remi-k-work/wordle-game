// services, features, and other libraries
import { Config, Effect, Layer, Redacted, String as Str } from "effect";
import { PgClient } from "@effect/sql-pg";

export const pgConfig: PgClient.PgPoolConfig = { transformQueryNames: Str.camelToSnake, transformResultNames: Str.snakeToCamel, transformJson: true };

export const makePgClientLayer = (databaseUrl: Redacted.Redacted<string>, ssl: boolean | object) =>
  PgClient.layer({ ...pgConfig, url: databaseUrl, ssl, idleTimeout: "10 seconds", connectTimeout: "10 seconds" });

export const PgLive = Layer.unwrap(
  Effect.gen(function* () {
    const env = yield* Config.literal("local", "ENV").pipe(Config.orElse(() => Config.succeed("prod" as const)));
    const ssl = env !== "local" ? { rejectUnauthorized: false } : false;
    const databaseUrl = yield* Config.redacted("DATABASE_URL");

    return makePgClientLayer(databaseUrl, ssl);
  })
).pipe(Layer.orDie);

// services, features, and other libraries
import { Config, Effect, Layer, String as Str } from "effect";
import { PgClient } from "@effect/sql-pg";

export const pgConfig: PgClient.PgClientConfig = { transformQueryNames: Str.camelToSnake, transformResultNames: Str.snakeToCamel, transformJson: true };

export const PgLive = Layer.unwrap(
  Effect.gen(function* () {
    const env = yield* Config.literal("local", "ENV").pipe(Config.orElse(() => Config.succeed("prod" as const)));
    const ssl = env !== "local" ? { rejectUnauthorized: false } : false;
    const databaseUrl = yield* Config.redacted("DATABASE_URL");

    return PgClient.layer({ url: databaseUrl, ssl, idleTimeout: "10 seconds", connectTimeout: "10 seconds", ...pgConfig });
  })
).pipe(Layer.orDie);

// services, features, and other libraries
import { Config, Effect, identity, Layer, String as Str } from "effect";
import { PgClient } from "@effect/sql-pg";

import { types } from "pg";

// Keep raw strings for dates/timestamps (handle parsing in Schema)
types.setTypeParser(types.builtins.DATE, identity);
types.setTypeParser(types.builtins.TIMESTAMP, identity);
types.setTypeParser(types.builtins.TIMESTAMPTZ, identity);
types.setTypeParser(types.builtins.JSON, identity);
types.setTypeParser(types.builtins.JSONB, identity);

export const pgConfig: PgClient.PgClientConfig = {
  transformQueryNames: Str.camelToSnake, // JS camelCase -> SQL snake_case
  transformResultNames: Str.snakeToCamel, // SQL snake_case -> JS camelCase
  transformJson: true,
  types,
};

export const PgLive = Layer.unwrap(
  Effect.gen(function* () {
    const env = yield* Config.literal("local", "ENV").pipe(Config.orElse(() => Config.succeed("prod" as const)));
    const ssl = env !== "local" ? { rejectUnauthorized: false } : false;
    const databaseUrl = yield* Config.redacted("DATABASE_URL");

    return PgClient.layer({ url: databaseUrl, ssl, idleTimeout: "10 seconds", connectTimeout: "10 seconds", ...pgConfig });
  })
).pipe(Layer.orDie);

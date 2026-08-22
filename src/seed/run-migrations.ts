import "dotenv/config";

// services, features, and other libraries
import { Config, Effect, Layer, Logger } from "effect";
import { NodeServices, NodeRuntime } from "@effect/platform-node";
import { Migrator } from "effect/unstable/sql";
import { PgMigrator } from "@effect/sql-pg";
import { makePgClientLayer } from "@/lib/pg-live";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer);

const main = Effect.gen(function* () {
  const env = yield* Config.literal("local", "ENV").pipe(Config.orElse(() => Config.succeed("prod" as const)));
  const ssl = env !== "local" ? { rejectUnauthorized: false } : false;
  const databaseUrl = yield* Config.redacted("DATABASE_URL");

  const pgClientLayer = makePgClientLayer(databaseUrl, ssl);

  yield* Effect.log("Running database migrations...");

  const result = yield* PgMigrator.run({ loader: Migrator.fromFileSystem("src/seed/migrations"), table: "schema_migrations" }).pipe(
    Effect.provide(pgClientLayer)
  );

  if (result.length === 0) {
    yield* Effect.log("No pending migrations — database is up to date.");
  } else {
    for (const [id, name] of result) {
      yield* Effect.log(`Applied migration ${id}_${name}`);
    }
    yield* Effect.log("All migrations applied successfully!");
  }
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);

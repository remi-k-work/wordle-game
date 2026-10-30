import "dotenv/config";

// services, features, and other libraries
import { Config, Effect } from "effect";
import { PgMigrator } from "@effect/sql-pg";
import { makePgClientLayer } from "@/lib/pg-config";
import { runSeed } from "./runtime";

const main = Effect.gen(function* () {
  // Node has no HYPERDRIVE binding: the connection string comes from .env (loaded above)
  const pgClientLayer = makePgClientLayer(yield* Config.Redacted("DATABASE_URL"));

  yield* Effect.log("Running database migrations...");

  const result = yield* PgMigrator.run({ loader: PgMigrator.fromFileSystem("src/seed/migrations"), table: "schema_migrations" }).pipe(
    Effect.provide(pgClientLayer)
  );

  if (result.length === 0) {
    yield* Effect.log("No pending migrations — database is up to date.");
  } else {
    yield* Effect.forEach(result, ([id, name]) => Effect.log(`Applied migration ${id}_${name}`), { discard: true });
    yield* Effect.log("All migrations applied successfully!");
  }
});

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);

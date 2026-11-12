import "dotenv/config";

// node
import { fileURLToPath } from "node:url";

// services, features, and other libraries
import { Config, Effect } from "effect";
import { PgMigrator } from "@effect/sql-pg";
import { makePgClientLayer } from "@/lib/pg-config";
import { runSeed } from "./runtime";

// Resolve the migrations directory against this module, not the CWD: the
// loader reads the directory and imports each file by path, so a script run
// from anywhere but the repo root would otherwise find no migrations
const migrationsDirectory = fileURLToPath(new URL("./migrations", import.meta.url));

const main = Effect.gen(function* () {
  // Node has no HYPERDRIVE binding: the connection string comes from .env (loaded above)
  const pgClientLayer = makePgClientLayer(yield* Config.Redacted("DATABASE_URL"));

  yield* Effect.log("Running database migrations...");

  const result = yield* PgMigrator.run({ loader: PgMigrator.fromFileSystem(migrationsDirectory), table: "schema_migrations" }).pipe(
    Effect.provide(pgClientLayer)
  );

  yield* Effect.forEach(result, ([id, name]) => Effect.log(`Applied migration ${id}_${name}`), { discard: true });
  yield* Effect.log(result.length === 0 ? "No pending migrations — database is up to date." : "All migrations applied successfully!");
});

// runSeed provides the shared Node layer and graceful teardown on CTRL+C
runSeed(main);

import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { PgClient } from "@effect/sql-pg";
import { Context, Effect, Layer, Redacted, Schema } from "effect";
import { SqlClient } from "effect/sql";
import { pgConfig } from "@/lib/pg-config";

class ContainerError extends Schema.TaggedError<ContainerError>()("ContainerError", {
  cause: Schema.Defect(),
}) {}

class PgContainer extends Context.Service<PgContainer>()("test/PgContainer", {
  make: Effect.acquireRelease(
    Effect.tryPromise({
      try: () => new PostgreSqlContainer("postgres:alpine").start(),
      catch: (cause) => new ContainerError({ cause }),
    }),
    (container) =>
      Effect.tryPromise({
        try: () => container.stop(),
        catch: (cause) => new ContainerError({ cause }),
      }).pipe(Effect.tapError(Effect.logError), Effect.orDie)
  ),
}) {
  static layer = Layer.effect(this, this.make);

  // Reuses pgConfig (transformQueryNames / transformResultNames / transformJson)
  // so the test exercises the same column-alias rewriting as production (F1)
  static ClientLive = Layer.unwrap(
    Effect.gen(function* () {
      const container = yield* PgContainer;
      return PgClient.layer({ url: Redacted.make(container.getConnectionUri()), ...pgConfig });
    })
  ).pipe(Layer.provide(this.layer));
}

export { PgContainer };

// The native pg client (rc.113+) rejects multi-statement prepared statements,
// so test DDL containing DROP + CREATE must run statement-by-statement
export const runDdlStatements = Effect.fn("runDdlStatements")(function* (ddl: string) {
  const sql = yield* SqlClient.SqlClient;
  const statements = ddl
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
  yield* Effect.forEach(statements, (statement) => sql.unsafe(statement));
});

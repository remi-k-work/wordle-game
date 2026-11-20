import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { PgClient } from "@effect/sql-pg";
import { Context, Effect, Layer, Redacted, Schema } from "effect";
import { SqlClient } from "effect/sql";
import { pgConfig } from "@/lib/pg-config";

class ContainerError extends Schema.TaggedError<ContainerError, { readonly brand: unique symbol }>()("ContainerError", {
  cause: Schema.Defect(),
}) {}

class PgContainer extends Context.Service<
  PgContainer,
  {
    readonly getConnectionUri: () => string;
  }
>()("test/PgContainer") {
  static layer = Layer.effect(
    PgContainer,
    Effect.acquireRelease(
      Effect.tryPromise({
        try: () => new PostgreSqlContainer("postgres:alpine").start(),
        catch: (cause) => new ContainerError({ cause }),
      }),
      (container) =>
        Effect.tryPromise({
          try: () => container.stop(),
          catch: (cause) => new ContainerError({ cause }),
          // A `stop()` that throws synchronously (rather than rejecting) surfaces
          // as a defect, which an error-based `tapError` would skip — teardown is
          // where a silent failure costs the most, so the log is cause-based like
          // every other log-then-recover in this repo
        }).pipe(Effect.tapCause(Effect.logError), Effect.orDie)
    ).pipe(Effect.map((container) => PgContainer.of({ getConnectionUri: () => container.getConnectionUri() })))
  );

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
// so test DDL containing DROP + CREATE must run statement-by-statement.
// The split is a plain `;` split, which is only sound because the fixtures
// below are hand-written DDL with no `;` inside a string literal, a `$$` body
// or a `--` comment — keep it that way rather than teaching this a parser
export const runDdlStatements = Effect.fn("runDdlStatements")(function* (ddl: string) {
  const sql = yield* SqlClient.SqlClient;
  const statements = ddl
    .split(";")
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
  yield* Effect.forEach(statements, (statement) => sql.unsafe(statement));
});

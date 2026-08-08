import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { PgClient } from "@effect/sql-pg";
import { Context, Data, Effect, Layer, Redacted } from "effect";
import { pgConfig } from "@/lib/pg-live";

class ContainerError extends Data.TaggedError("ContainerError")<{
  cause: unknown;
}> {}

class PgContainer extends Context.Service<PgContainer>()("test/PgContainer", {
  make: Effect.acquireRelease(
    Effect.tryPromise({
      try: () => new PostgreSqlContainer("postgres:alpine").start(),
      catch: (cause) => new ContainerError({ cause }),
    }),
    (container) => Effect.promise(() => container.stop())
  ),
}) {
  static layer = Layer.effect(this, this.make);

  // Reuses pgConfig (transformQueryNames / transformResultNames / transformJson)
  // so the test exercises the same column-alias rewriting as production (F1).
  static ClientLive = Layer.unwrap(
    Effect.gen(function* () {
      const container = yield* PgContainer;
      return PgClient.layer({ url: Redacted.make(container.getConnectionUri()), ...pgConfig });
    })
  ).pipe(Layer.provide(this.layer));
}

export { PgContainer };

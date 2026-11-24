import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, Layer, Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";
import { makeRpcClient } from "../helpers";

// `makeRpcClient` owns the test seams for every generated RPC client. These
// tests pin the two seams on a throwaway group so they never drift:
//   - `layerTest` is protocol-faithful: it answers through the real
//     client/server machinery, driven only by the group's handlers.
//   - `layerFake` is a content fake: provided methods are served, and an
//     omitted method fails loudly instead of silently doing nothing.

class RpcMath extends RpcGroup.make(
  Rpc.make("double", {
    payload: { value: Schema.Finite },
    success: Schema.Finite,
  })
) {}

class RpcMathClient extends makeRpcClient("RpcMathClient", RpcMath, "/rpc/math") {}

describe("makeRpcClient", () => {
  it.effect("layerFake serves the implementation it was given", () =>
    Effect.gen(function* () {
      const client = yield* RpcMathClient;
      const result = yield* client.double({ value: 21 });

      expect(result).toBe(42);
    }).pipe(
      Effect.provide(
        RpcMathClient.layerFake({
          double: ({ value }) => Effect.succeed(value * 2),
        })
      )
    )
  );

  it.effect("layerFake fails loudly when an unimplemented method is called", () =>
    Effect.gen(function* () {
      const client = yield* RpcMathClient;
      const exit = yield* Effect.exit(client.double({ value: 1 }));

      expect(Exit.isFailure(exit)).toBe(true);
    }).pipe(Effect.provide(RpcMathClient.layerFake({})))
  );

  it.effect("layerTest round-trips through the group's real handlers", () =>
    Effect.gen(function* () {
      const client = yield* RpcMathClient;
      const result = yield* client.double({ value: 21 });

      expect(result).toBe(42);
    }).pipe(
      Effect.provide(
        RpcMathClient.layerTest.pipe(
          Layer.provide(RpcMath.toLayer({ double: ({ value }) => Effect.succeed(value * 2) }))
        )
      )
    )
  );
});

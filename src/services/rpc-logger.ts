// services, features, and other libraries
import { Effect, Layer } from "effect";
import { RpcMiddleware } from "effect/rpc";

export class RpcLogger extends RpcMiddleware.Service<RpcLogger>()("RpcLogger") {
  static readonly layer: Layer.Layer<RpcLogger> = Layer.succeed(
    RpcLogger,
    RpcLogger.of((effect, opts) =>
      // Observe the handler's outcome, logging failures without altering the
      // response. The failing method travels as a structured annotation (not
      // interpolated into the message) so log consumers can parse it as a field
      Effect.tapCause(effect, (cause) =>
        Effect.annotateLogs(Effect.logError("[RPC REQUEST FAILED]:", cause), {
          "rpc.method": opts.rpc._tag,
          "rpc.clientId": opts.client.id,
        })
      )
    )
  );
}

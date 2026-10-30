// services, features, and other libraries
import { Layer, Redacted } from "effect";
import { makePgClientLayer } from "@/lib/pg-config";
import { env } from "cloudflare:workers";

// Worker-side wiring only: everything shareable with Node lives in pg-config.ts
//
// env.HYPERDRIVE may only be touched inside a handler — reading it while the worker's modules
// evaluate (global scope) throws "Disallowed operation called within global scope". So the
// binding read and the layer construction are deferred to layer build time (`Layer.suspend`), which
// happens per request (makeRpcHandler builds the web handler inside the request), never at import time
export const PgLive = Layer.suspend(() => makePgClientLayer(Redacted.make(env.HYPERDRIVE.connectionString))).pipe(Layer.orDie);

// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { sessionIdAtom } from "@/features/player/state";

export const getGuessDistributionsAction = RuntimeAtom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    const sessionId = get(sessionIdAtom);

    const { getGuessDistribution } = yield* RpcTelemetryClient;
    return yield* Effect.all([getGuessDistribution({ sessionId, solutionsLanguage: "En" }), getGuessDistribution({ sessionId, solutionsLanguage: "Pl" })], {
      concurrency: 2,
    });
  })
);

export const getTimeToSolveDistributionsAction = RuntimeAtom.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    const sessionId = get(sessionIdAtom);

    const { getTimeToSolveDistribution } = yield* RpcTelemetryClient;
    return yield* Effect.all(
      [getTimeToSolveDistribution({ sessionId, solutionsLanguage: "En" }), getTimeToSolveDistribution({ sessionId, solutionsLanguage: "Pl" })],
      {
        concurrency: 2,
      }
    );
  })
);

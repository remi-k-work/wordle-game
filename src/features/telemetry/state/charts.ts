// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { sessionIdAtom } from "@/features/player/state";

export const guessDistributionsAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    const sessionId = get(sessionIdAtom);

    const { getGuessDistribution } = yield* RpcTelemetryClient;
    return yield* Effect.all([getGuessDistribution({ sessionId, solutionsLanguage: "En" }), getGuessDistribution({ sessionId, solutionsLanguage: "Pl" })], {
      concurrency: 2,
    });
  })
);

export const timeToSolveDistributionsAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
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

export const arcadeStreakDistributionsAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    const sessionId = get(sessionIdAtom);

    const { getArcadeStreakDistribution } = yield* RpcTelemetryClient;
    return yield* Effect.all(
      [getArcadeStreakDistribution({ sessionId, solutionsLanguage: "En" }), getArcadeStreakDistribution({ sessionId, solutionsLanguage: "Pl" })],
      {
        concurrency: 2,
      }
    );
  })
);

export const openingGuessesFrequenciesAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    const sessionId = get(sessionIdAtom);

    const { getOpeningGuessesFrequency } = yield* RpcTelemetryClient;
    return yield* Effect.all(
      [getOpeningGuessesFrequency({ sessionId, solutionsLanguage: "En" }), getOpeningGuessesFrequency({ sessionId, solutionsLanguage: "Pl" })],
      {
        concurrency: 2,
      }
    );
  })
);

export const failedWordsFrequenciesAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    const sessionId = get(sessionIdAtom);

    const { getFailedWordsFrequency } = yield* RpcTelemetryClient;
    return yield* Effect.all(
      [getFailedWordsFrequency({ sessionId, solutionsLanguage: "En" }), getFailedWordsFrequency({ sessionId, solutionsLanguage: "Pl" })],
      {
        concurrency: 2,
      }
    );
  })
);

export const runDeathReasonFrequenciesAtom = RuntimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    const sessionId = get(sessionIdAtom);

    const { getRunDeathReasonFrequency } = yield* RpcTelemetryClient;
    return yield* Effect.all(
      [getRunDeathReasonFrequency({ sessionId, solutionsLanguage: "En" }), getRunDeathReasonFrequency({ sessionId, solutionsLanguage: "Pl" })],
      {
        concurrency: 2,
      }
    );
  })
);

export const anyCountersAtom = Atom.family((counterName: string) =>
  RuntimeAtom.atom(
    Effect.fnUntraced(function* (get) {
      const sessionId = get(sessionIdAtom);

      const { getAnyCounter } = yield* RpcTelemetryClient;
      return yield* Effect.all(
        [getAnyCounter({ counterName, sessionId, solutionsLanguage: "En" }), getAnyCounter({ counterName, sessionId, solutionsLanguage: "Pl" })],
        {
          concurrency: 2,
        }
      );
    })
  )
);

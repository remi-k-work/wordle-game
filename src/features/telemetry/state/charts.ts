// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeCharts } from "@/lib/runtime-charts";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { sessionIdAtom } from "@/features/player/state";

export const getGuessDistributionsAction = RuntimeCharts.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
    const sessionId = get(sessionIdAtom);

    const { getGuessDistribution } = yield* RpcTelemetryClient;
    return yield* Effect.all([getGuessDistribution({ sessionId, solutionsLanguage: "En" }), getGuessDistribution({ sessionId, solutionsLanguage: "Pl" })], {
      concurrency: 2,
    });
  })
);

export const getTimeToSolveDistributionsAction = RuntimeCharts.fn(
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

export const getArcadeStreakDistributionsAction = RuntimeCharts.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
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

export const getOpeningGuessesFrequenciesAction = RuntimeCharts.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
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

export const getFailedWordsFrequenciesAction = RuntimeCharts.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
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

export const getRunDeathReasonFrequenciesAction = RuntimeCharts.fn(
  Effect.fnUntraced(function* (_: void, get: Atom.FnContext) {
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

export const getAnyCountersAction = RuntimeCharts.fn(
  Effect.fnUntraced(function* (counterName: string, get: Atom.FnContext) {
    const sessionId = get(sessionIdAtom);

    const { getAnyCounter } = yield* RpcTelemetryClient;
    return yield* Effect.all(
      [getAnyCounter({ counterName, sessionId, solutionsLanguage: "En" }), getAnyCounter({ counterName, sessionId, solutionsLanguage: "Pl" })],
      {
        concurrency: 2,
      }
    );
  })
);

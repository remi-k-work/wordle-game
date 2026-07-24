// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { sessionIdAtom } from "@/features/player/state";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { AnyAvgStatArgs, AnyCounterArgs } from "@/features/telemetry/services/charts-db";

export const guessDistributionAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(
    Effect.fnUntraced(function* (get) {
      const sessionId = get(sessionIdAtom);

      const { getGuessDistribution } = yield* RpcTelemetryClient;
      return yield* getGuessDistribution({ sessionId, solutionsLanguage });
    })
  )
);

export const timeToSolveDistributionAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(
    Effect.fnUntraced(function* (get) {
      const sessionId = get(sessionIdAtom);

      const { getTimeToSolveDistribution } = yield* RpcTelemetryClient;
      return yield* getTimeToSolveDistribution({ sessionId, solutionsLanguage }).pipe(
        Effect.map((data) => data.map((row) => ({ ...row, maxSeconds: row.maxSeconds === null ? Infinity : row.maxSeconds })))
      );
    })
  )
);

export const arcadeStreakDistributionAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(
    Effect.fnUntraced(function* (get) {
      const sessionId = get(sessionIdAtom);

      const { getArcadeStreakDistribution } = yield* RpcTelemetryClient;
      return yield* getArcadeStreakDistribution({ sessionId, solutionsLanguage }).pipe(
        Effect.map((data) => data.map((row) => ({ ...row, streak: row.streak === null ? Infinity : row.streak })))
      );
    })
  )
);

export const openingGuessesFrequencyAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(
    Effect.fnUntraced(function* (get) {
      const sessionId = get(sessionIdAtom);

      const { getOpeningGuessesFrequency } = yield* RpcTelemetryClient;
      return yield* getOpeningGuessesFrequency({ sessionId, solutionsLanguage });
    })
  )
);

export const failedWordsFrequencyAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(
    Effect.fnUntraced(function* (get) {
      const sessionId = get(sessionIdAtom);

      const { getFailedWordsFrequency } = yield* RpcTelemetryClient;
      return yield* getFailedWordsFrequency({ sessionId, solutionsLanguage });
    })
  )
);

export const runDeathReasonFrequencyAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  RuntimeAtom.atom(
    Effect.fnUntraced(function* (get) {
      const sessionId = get(sessionIdAtom);

      const { getRunDeathReasonFrequency } = yield* RpcTelemetryClient;
      return yield* getRunDeathReasonFrequency({ sessionId, solutionsLanguage });
    })
  )
);

export const anyCounterAtom = Atom.family(
  ({ counterName, solutionsLanguage }: { counterName: AnyCounterArgs["counterName"]; solutionsLanguage: SolutionsLanguage }) =>
    RuntimeAtom.atom(
      Effect.fnUntraced(function* (get) {
        const sessionId = get(sessionIdAtom);

        const { getAnyCounter } = yield* RpcTelemetryClient;
        return yield* getAnyCounter({ counterName, sessionId, solutionsLanguage });
      })
    )
);

export const anyAvgStatAtom = Atom.family(
  ({
    statColumn,
    statTable,
    solutionsLanguage,
  }: {
    statColumn: AnyAvgStatArgs["statColumn"];
    statTable: AnyAvgStatArgs["statTable"];
    solutionsLanguage: SolutionsLanguage;
  }) =>
    RuntimeAtom.atom(
      Effect.fnUntraced(function* (get) {
        const sessionId = get(sessionIdAtom);

        const { getAnyAvgStat } = yield* RpcTelemetryClient;
        return yield* getAnyAvgStat({ statColumn, statTable, sessionId, solutionsLanguage });
      })
    )
);

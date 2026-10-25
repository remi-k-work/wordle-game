// oxlint-disable typescript/no-misused-spread

// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { sessionIdAtom } from "@/features/player/state/player";

// types
import type { Context } from "effect";
import type { SolutionsLanguage } from "@/features/game/domain/models";
import type { AnyAvgStatArgs, AnyCounterArgs, BestRunTrophyCardArgs } from "@/features/telemetry/services/charts-db/models";

// Treats a missing cumulative-total bucket (NULL) as unbounded (Infinity) for charting
const nullToInfinity = (value: number | null) => value ?? Infinity;

// One session-scoped chart read: resolves the telemetry RPC client, tags the
// request with the player's session id, and caches the result for 5 minutes
// of idle time (remounts within that window reuse it instead of refetching)
const chartAtom = <A, E>(fetch: (client: Context.Service.Shape<typeof RpcTelemetryClient>, sessionId: string) => Effect.Effect<A, E>) =>
  RuntimeAtom.atom((get) => Effect.flatMap(RpcTelemetryClient, (client) => fetch(client, get(sessionIdAtom)))).pipe(Atom.setIdleTTL("5 minutes"));

export const guessDistributionAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) => client.getGuessDistribution({ sessionId, solutionsLanguage }))
);

export const timeToSolveDistributionAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) =>
    client
      .getTimeToSolveDistribution({ sessionId, solutionsLanguage })
      .pipe(Effect.map((data) => data.map((row) => ({ ...row, maxSeconds: nullToInfinity(row.maxSeconds) }))))
  )
);

export const arcadeStreakDistributionAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) =>
    client
      .getArcadeStreakDistribution({ sessionId, solutionsLanguage })
      .pipe(Effect.map((data) => data.map((row) => ({ ...row, streak: nullToInfinity(row.streak) }))))
  )
);

export const openingGuessesFrequencyAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) => client.getOpeningGuessesFrequency({ sessionId, solutionsLanguage }))
);

export const failedWordsFrequencyAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) => client.getFailedWordsFrequency({ sessionId, solutionsLanguage }))
);

export const runDeathReasonFrequencyAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) => client.getRunDeathReasonFrequency({ sessionId, solutionsLanguage }))
);

export const anyCounterAtom = Atom.family(
  ({ counterName, solutionsLanguage }: { counterName: AnyCounterArgs["counterName"]; solutionsLanguage: SolutionsLanguage }) =>
    chartAtom((client, sessionId) => client.getAnyCounter({ counterName, sessionId, solutionsLanguage }))
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
  }) => chartAtom((client, sessionId) => client.getAnyAvgStat({ statColumn, statTable, sessionId, solutionsLanguage }))
);

export const hardestWordsLeaderboardAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) => client.getHardestWordsLeaderboard({ sessionId, solutionsLanguage }))
);

export const bestRunTrophyCardAtom = Atom.family(
  ({ whichBestRun, solutionsLanguage }: { whichBestRun: BestRunTrophyCardArgs["whichBestRun"]; solutionsLanguage: SolutionsLanguage }) =>
    chartAtom((client, sessionId) => client.getBestRunTrophyCard({ whichBestRun, sessionId, solutionsLanguage }))
);

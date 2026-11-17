// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { RuntimeAtom } from "@/lib/runtime-client";
import { RpcTelemetryClient } from "@/features/telemetry/rpc/client";
import { sessionIdAtom } from "@/features/player/state/player";
import { withUnboundedBucket } from "@/features/charts/domain/helpers";

// types
import type { Context } from "effect";
import type { SolutionsLanguage } from "@/features/game/domain/models";
import type {
  AnyAvgStatArgs,
  AnyCounterArgs,
  BestRunTrophyCardArgs,
  ArcadeStreakDistributionData,
  TimeToSolveDistributionData,
} from "@/features/charts/domain/models";

// One session-scoped chart read: resolves the telemetry RPC client
const chartAtom = <A, E>(fetch: (client: Context.Service.Shape<typeof RpcTelemetryClient>, sessionId: string) => Effect.Effect<A, E>) =>
  RuntimeAtom.atom((get) => {
    // Read the session id inside the atom read context so this atom re-runs (and re-subscribes) when the player's session changes
    const sessionId = get(sessionIdAtom);

    return Effect.flatMap(RpcTelemetryClient, (client) => fetch(client, sessionId));
  }).pipe(Atom.setIdleTTL("5 minutes"));

export const guessDistributionAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) => client.getGuessDistribution({ sessionId, solutionsLanguage }))
);

// The two open-ended distributions resolve their trailing NULL bucket to `Infinity` through the one shared helper
const unboundedMaxSeconds = withUnboundedBucket<TimeToSolveDistributionData>("maxSeconds");
const unboundedStreak = withUnboundedBucket<ArcadeStreakDistributionData>("streak");

export const timeToSolveDistributionAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) =>
    client.getTimeToSolveDistribution({ sessionId, solutionsLanguage }).pipe(
      // A non-empty `maxSeconds` is a rounding artifact of the bucket boundary
      Effect.map(unboundedMaxSeconds)
    )
  )
);

export const arcadeStreakDistributionAtom = Atom.family((solutionsLanguage: SolutionsLanguage) =>
  chartAtom((client, sessionId) =>
    client.getArcadeStreakDistribution({ sessionId, solutionsLanguage }).pipe(
      // Same open-ended bucket rule, applied to the streak column
      Effect.map(unboundedStreak)
    )
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

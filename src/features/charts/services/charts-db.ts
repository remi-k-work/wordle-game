// services, features, and other libraries
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient } from "effect/sql";
import { AnyChartArgs, ArcadeStreakDistributionData, GuessDistributionData, TimeToSolveDistributionData } from "@/features/charts/domain/models";
import { cumulativeToDistribution } from "@/features/charts/domain/helpers";
import { dieOnDbFailure } from "@/domain/helpers";
import { anyAvgStatQuery } from "@/features/charts/queries/any-avg-stat";
import { anyCounterQuery } from "@/features/charts/queries/any-counter";
import { arcadeStreakDistributionQuery } from "@/features/charts/queries/arcade-streak-distribution";
import { bestRunTrophyCardQuery } from "@/features/charts/queries/best-run-trophy-card";
import { failedWordsFrequencyQuery } from "@/features/charts/queries/failed-words-frequency";
import { guessDistributionQuery } from "@/features/charts/queries/guess-distribution";
import { hardestWordsLeaderboardQuery } from "@/features/charts/queries/hardest-words-leaderboard";
import { openingGuessesFrequencyQuery } from "@/features/charts/queries/opening-guesses-frequency";
import { runDeathReasonFrequencyQuery } from "@/features/charts/queries/run-death-reason-frequency";
import { timeToSolveDistributionQuery } from "@/features/charts/queries/time-to-solve-distribution";

// Schema.decodeEffect builds a parser on every call, so build the array
// decoders once at module scope instead of per request
const decodeGuessDistributionData = Schema.decodeEffect(Schema.Array(GuessDistributionData));
const decodeTimeToSolveDistributionData = Schema.decodeEffect(Schema.Array(TimeToSolveDistributionData));
const decodeArcadeStreakDistributionData = Schema.decodeEffect(Schema.Array(ArcadeStreakDistributionData));

export class ChartsDB extends Context.Service<ChartsDB>()("ChartsDB", {
  make: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    // Each query factory builds a `SqlSchema`, so the factories are hoisted and
    // built once per layer instead of once per request
    const guessDistributionQueryFn = guessDistributionQuery(sql);
    const timeToSolveDistributionQueryFn = timeToSolveDistributionQuery(sql);
    const arcadeStreakDistributionQueryFn = arcadeStreakDistributionQuery(sql);
    const openingGuessesFrequencyQueryFn = openingGuessesFrequencyQuery(sql);
    const failedWordsFrequencyQueryFn = failedWordsFrequencyQuery(sql);
    const runDeathReasonFrequencyQueryFn = runDeathReasonFrequencyQuery(sql);
    const anyCounterQueryFn = anyCounterQuery(sql);
    const anyAvgStatQueryFn = anyAvgStatQuery(sql);
    const hardestWordsLeaderboardQueryFn = hardestWordsLeaderboardQuery(sql);
    const bestRunTrophyCardQueryFn = bestRunTrophyCardQuery(sql);

    // Every distribution chart shares one rule for the trailing `[null, total]`
    // bucket the histogram SQL emits: `cumulativeToDistribution` must see it (it
    // is the percentage denominator), but it carries no bucket of its own, so
    // whether it survives into the decoded rows depends on whether the chart's
    // bucket has an open-ended range:
    //   - guesses-per-win is a closed 1..MAX_TURNS range, so that NULL row is
    //     pure total and is dropped below
    //   - time-to-solve and arcade-streak are open-ended ("20+ seconds", "5+
    //     wins"), so the NULL row IS their last bucket. It is kept here and the
    //     state layer resolves it to `Infinity` (see state/charts.ts)
    //
    // The three distribution getters are therefore one pipeline — query, derive
    // discrete buckets, optionally drop the total row, decode against the
    // strict schema — differing only in the bucket key (turn / maxSeconds /
    // streak), the decoder, and `dropNullBucket`. fnUntraced because the server
    // graph has no Tracer layer: a traced span here is pure per-request overhead
    const makeDistributionGetter = <Row extends { readonly personal: number; readonly global: number }, Data, DecodeError extends { _tag: string }>(
      queryFn: (request: AnyChartArgs) => Effect.Effect<ReadonlyArray<Row>, never, never>,
      decodeData: (chartData: readonly Row[]) => Effect.Effect<ReadonlyArray<Data>, DecodeError, never>,
      bucketKey: keyof Row & string,
      dropNullBucket: boolean
    ) =>
      Effect.fnUntraced(function* (request: AnyChartArgs) {
        const rows = yield* queryFn(request);

        // Re-broadcast the row (so its bucket column survives) with the derived
        // discrete counts and percentages in place of the cumulative ones
        const chartData = cumulativeToDistribution(rows, (row, personal, global, personalPct, globalPct) => ({
          ...row,
          personal,
          global,
          personalPct,
          globalPct,
        }));

        // Decode against the strict schema, as recommended for final domain mapping
        return yield* decodeData(dropNullBucket ? chartData.filter((row) => row[bucketKey] !== null) : chartData).pipe(dieOnDbFailure);
      });

    const getGuessDistribution = makeDistributionGetter(guessDistributionQueryFn, decodeGuessDistributionData, "turn", true);
    const getTimeToSolveDistribution = makeDistributionGetter(timeToSolveDistributionQueryFn, decodeTimeToSolveDistributionData, "maxSeconds", false);
    const getArcadeStreakDistribution = makeDistributionGetter(arcadeStreakDistributionQueryFn, decodeArcadeStreakDistributionData, "streak", false);

    // Simple passthroughs to query functions. Referencing the hoisted query
    // directly keeps this layer a thin boundary: the queries already carry the
    // shared `dieOnDbFailure` policy, and there is no logic or tracing value to
    // add here that would justify wrapping each call in its own Effect
    return {
      getGuessDistribution,
      getTimeToSolveDistribution,
      getArcadeStreakDistribution,
      getOpeningGuessesFrequency: openingGuessesFrequencyQueryFn,
      getFailedWordsFrequency: failedWordsFrequencyQueryFn,
      getRunDeathReasonFrequency: runDeathReasonFrequencyQueryFn,
      getAnyCounter: anyCounterQueryFn,
      getAnyAvgStat: anyAvgStatQueryFn,
      getHardestWordsLeaderboard: hardestWordsLeaderboardQueryFn,
      getBestRunTrophyCard: bestRunTrophyCardQueryFn,
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}

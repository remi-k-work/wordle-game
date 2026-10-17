// services, features, and other libraries
import { SqlClient } from "effect/sql";
import { ArcadeStreakDistributionData } from "@/features/telemetry/services/charts-db/models";
import { makeHistogramDistributionQuery } from "./make-histogram-distribution-query";

export const arcadeStreakDistributionQuery = (sql: SqlClient.SqlClient) =>
  makeHistogramDistributionQuery(sql)({
    metricName: "arcadeRunLength",
    bucketAlias: "streak",
    Result: ArcadeStreakDistributionData,
  });

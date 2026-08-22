// services, features, and other libraries
import { SqlClient } from "effect/unstable/sql";
import { TimeToSolveDistributionData } from "@/features/telemetry/services/charts-db";
import { makeHistogramDistributionQuery } from "./make-histogram-distribution-query";

export const timeToSolveDistributionQuery = (sql: SqlClient.SqlClient) =>
  makeHistogramDistributionQuery(sql)({
    metricName: "timeToSolve",
    bucketAlias: "max_seconds",
    Result: TimeToSolveDistributionData,
  });

// services, features, and other libraries
import { SqlClient } from "effect/sql";
import { GuessDistributionData } from "@/features/telemetry/services/charts-db/models";
import { makeHistogramDistributionQuery } from "./make-histogram-distribution-query";

export const guessDistributionQuery = (sql: SqlClient.SqlClient) =>
  makeHistogramDistributionQuery(sql)({
    metricName: "guessesToWin",
    bucketAlias: "turn",
    Result: GuessDistributionData,
  });

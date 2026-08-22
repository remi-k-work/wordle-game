// services, features, and other libraries
import { SqlClient } from "effect/unstable/sql";
import { FailedWordsFrequencyData } from "@/features/telemetry/services/charts-db";
import { makeWordFrequencyQuery } from "./make-word-frequency-query";

export const failedWordsFrequencyQuery = (sql: SqlClient.SqlClient) =>
  makeWordFrequencyQuery(sql)({
    metricName: "failedWords",
    Result: FailedWordsFrequencyData,
  });

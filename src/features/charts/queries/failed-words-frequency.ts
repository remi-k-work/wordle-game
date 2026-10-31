// services, features, and other libraries
import { SqlClient } from "effect/sql";
import { FailedWordsFrequencyData } from "@/features/charts/domain/models";
import { makeWordFrequencyQuery } from "./make-word-frequency-query";

export const failedWordsFrequencyQuery = (sql: SqlClient.SqlClient) =>
  makeWordFrequencyQuery(sql)({
    metricName: "failedWords",
    Result: FailedWordsFrequencyData,
  });

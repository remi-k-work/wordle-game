// services, features, and other libraries
import { SqlClient } from "effect/unstable/sql";
import { OpeningGuessesFrequencyData } from "@/features/telemetry/services/charts-db";
import { makeWordFrequencyQuery } from "./make-word-frequency-query";

export const openingGuessesFrequencyQuery = (sql: SqlClient.SqlClient) =>
  makeWordFrequencyQuery(sql)({
    metricName: "openingGuesses",
    Result: OpeningGuessesFrequencyData,
  });

// services, features, and other libraries
import { SqlClient } from "effect/sql";
import { OpeningGuessesFrequencyData } from "@/features/charts/domain/models";
import { makeWordFrequencyQuery } from "./make-word-frequency-query";

export const openingGuessesFrequencyQuery = (sql: SqlClient.SqlClient) =>
  makeWordFrequencyQuery(sql)({
    metricName: "openingGuesses",
    Result: OpeningGuessesFrequencyData,
  });

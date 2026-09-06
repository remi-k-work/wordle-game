// services, features, and other libraries
import { Layer, Logger, ManagedRuntime } from "effect";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), HighScoreDB.layer);

// The services a server page-main may require: exactly what RuntimeServer provides.
export type ServerMainServices = Layer.Success<typeof MainLayer>;

export const RuntimeServer = ManagedRuntime.make(MainLayer);

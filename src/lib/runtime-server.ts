// services, features, and other libraries
import { Layer, Logger, ManagedRuntime } from "effect";
import { HighScoreDB } from "@/features/high-score/services/high-score-db";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), HighScoreDB.layer);

export const RuntimeServer = ManagedRuntime.make(MainLayer);

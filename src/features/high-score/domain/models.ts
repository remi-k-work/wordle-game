// services, features, and other libraries
import { Schema } from "effect";
import { AddHighScoreSchema, HighScoreSchema } from ".";

export type HighScore = Schema.Schema.Type<typeof HighScoreSchema>;
export type AddHighScore = Schema.Schema.Type<typeof AddHighScoreSchema>;

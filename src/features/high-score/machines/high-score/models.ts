// services, features, and other libraries
import { Schema } from "effect";
import { HighScoreEntry } from "@/features/high-score/domain/models";

// types
export type HighScore = typeof HighScore.Type;

export const HighScore = Schema.Struct({
  playerName: HighScoreEntry.fields.playerName,
  runScore: HighScoreEntry.fields.score,
  streak: HighScoreEntry.fields.streak,
  solutionsLanguage: HighScoreEntry.fields.solutionsLang,
  newHighScoreId: Schema.Option(HighScoreEntry.fields.id),
});

// The schema for adding a new high score entry (the required fields only)
export class AddNewHighScore extends Schema.Class<AddNewHighScore, { readonly brand: unique symbol }>("AddNewHighScore")({
  playerName: HighScoreEntry.fields.playerName,
  score: HighScoreEntry.fields.score,
  streak: HighScoreEntry.fields.streak,
  solutionsLang: HighScoreEntry.fields.solutionsLang,
}) {}

// services, features, and other libraries
import { Effect, Schema } from "effect";
import { SolutionsLanguage } from "@/features/game/domain/models";
import { BasePage } from "@/domain/models";

// Represents the high score entry for a player
export class HighScoreEntry extends Schema.Class<HighScoreEntry, { readonly brand: unique symbol }>("HighScoreEntry")({
  id: Schema.Int.check(Schema.isGreaterThan(0)),
  playerName: Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(3)),
  score: Schema.Natural,
  streak: Schema.Natural,
  solutionsLang: SolutionsLanguage,
  // The pg client (v4 stable) decodes `timestamptz` columns as JS `Date`
  // instances (it decoded epoch millis in the v4 beta), so the DB boundary
  // schema must accept `Date` and turn it into a `DateTime.Utc`
  createdAt: Schema.DateTimeUtcFromDate,
}) {}

// The high score page with all its inputs (params and searchParams)
export class HighScorePage extends BasePage.extend<HighScorePage>("HighScorePage")({
  searchParams: Schema.Struct({ sl: SolutionsLanguage.pipe(Schema.withDecodingDefault(Effect.succeed("En"))) }),
}) {}

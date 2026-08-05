// services, features, and other libraries
import { Schema } from "effect";

export type OverdriveHackId = typeof OverdriveHackId.Type;
export type SonarReveal = typeof SonarReveal.Type;
export type TheOverride = typeof TheOverride.Type;
export type OverdriveHackEffect = typeof OverdriveHackEffect.Type;

export const OverdriveHackId = Schema.Literals(["emp", "sonar", "override"]);

export const SonarReveal = Schema.Struct({
  vowel: Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(1)),
  positions: Schema.Array(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
});
export const TheOverride = Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()));

export const OverdriveHackEffect = Schema.TaggedUnion({
  EmpApplied: { letters: Schema.Array(Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(1))) },
  SonarApplied: SonarReveal.fields,
  OverrideApplied: { theOverride: TheOverride },
});

// Per-puzzle hack state. Effects belong here rather than in WordChallenge,
// which remains the source of truth for player-entered guesses.
export class OverdriveHacks extends Schema.Class<OverdriveHacks>("OverdriveHacks")({
  // Holds the resolved effect between the resolve actor's onDone and the score-charge verdict
  pendingEffect: Schema.Option(OverdriveHackEffect),
  empNukedLetters: Schema.Array(Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(1))),
  sonarReveals: Schema.Array(SonarReveal),
  theOverride: Schema.Option(TheOverride),
}) {}

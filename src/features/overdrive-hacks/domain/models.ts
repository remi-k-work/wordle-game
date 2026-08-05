// services, features, and other libraries
import { Schema } from "effect";

export type OverdriveHackId = typeof OverdriveHackId.Type;
export type SonarReveal = typeof SonarReveal.Type;
export type TheOverride = typeof TheOverride.Type;

export const OverdriveHackId = Schema.Literals(["emp", "sonar", "override"]);

export const SonarReveal = Schema.Struct({
  vowel: Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(1)),
  positions: Schema.Array(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
});
export const TheOverride = Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()));

// Per-puzzle overdrive hack state
export class OverdriveHacks extends Schema.Class<OverdriveHacks>("OverdriveHacks")({
  empNukedLetters: Schema.Array(Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(1))),
  sonarReveals: Schema.Array(SonarReveal),
  theOverride: Schema.Option(TheOverride),
}) {}

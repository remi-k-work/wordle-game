// services, features, and other libraries
import { Schema } from "effect";
import { Letter } from "@/features/game/domain/models";

// types
export type OverdriveHackId = typeof OverdriveHackId.Type;
export type SonarReveal = typeof SonarReveal.Type;
export type OverdriveHacks = typeof OverdriveHacks.Type;

export const OverdriveHackId = Schema.Literals(["emp", "sonar", "override"]);

export const SonarReveal = Schema.Struct({
  vowel: Letter,
  positions: Schema.Array(Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))),
});

// Per-puzzle overdrive hack state
export const OverdriveHacks = Schema.Struct({
  empNukedLetters: Schema.Array(Letter),
  sonarReveals: Schema.Array(SonarReveal),
  theOverride: Schema.Option(Schema.Trim.pipe(Schema.check(Schema.isNonEmpty()))),
  theOverrideAudio: Schema.Option(Schema.Uint8Array),
});

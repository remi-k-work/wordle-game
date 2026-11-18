// services, features, and other libraries
import { Schema } from "effect";
import { Letter } from "@/features/game/domain/models";
import { SonarReveal } from "@/features/overdrive-hacks/domain/models";

// types
export type OverdriveHacks = typeof OverdriveHacks.Type;

// Per-puzzle overdrive hack state
export const OverdriveHacks = Schema.Struct({
  empNukedLetters: Schema.Array(Letter),
  sonarReveals: Schema.Array(SonarReveal),
  theOverride: Schema.Option(Schema.Trim.check(Schema.isNonEmpty())),
  theOverrideAudio: Schema.Option(Schema.Uint8Array),
});

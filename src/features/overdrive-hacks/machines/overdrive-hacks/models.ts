// services, features, and other libraries
import { Schema } from "effect";
import { Letter } from "@/features/game/domain/models";
import { OverdriveHackId, SonarReveal } from "@/features/overdrive-hacks/domain/models";

// types
import type { EventUnion } from "@/lib/machine-setup";
export type OverdriveHacks = typeof OverdriveHacks.Type;
export type Events = EventUnion<typeof Events>;

// Per-puzzle overdrive hack state
export const OverdriveHacks = Schema.Struct({
  empNukedLetters: Schema.Array(Letter),
  sonarReveals: Schema.Array(SonarReveal),
  theOverride: Schema.Option(Schema.Trim.check(Schema.isNonEmpty())),
  theOverrideAudio: Schema.Option(Schema.Uint8Array),
});

// Events are part of the machine's interface; guards receive this union as `event`
export const Events = {
  solutionsLanguageChanged: Schema.Struct({}),
  puzzleStarted: Schema.Struct({}),
  puzzleEnded: Schema.Struct({}),
  hackRequested: Schema.Struct({ overdriveHackId: OverdriveHackId }),
};

// Action params are part of the machine's interface; implementations receive
// exactly these params (plus `self`)
export const Actions = {
  syncBlockedLetters: { params: Schema.Struct({ blockedLetters: Schema.Array(Letter) }) },
  chargeHack: { params: Schema.Struct({ overdriveHackId: OverdriveHackId }) },
  onOverrideHackApplied: { params: Schema.Struct({}) },
  logHackFailure: { params: Schema.Struct({ hackId: Schema.String, error: Schema.Unknown }) },
};

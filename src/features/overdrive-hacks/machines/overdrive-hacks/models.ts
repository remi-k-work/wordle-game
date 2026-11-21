// services, features, and other libraries
import { Schema } from "effect";
import { Letter } from "@/features/game/domain/models";
import { OverdriveHackId, SonarReveal } from "@/features/overdrive-hacks/domain/models";

// types
import type { EventUnion } from "@/lib/machine-setup";

export type OverdriveHacks = typeof OverdriveHacks.Type;

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
  "puzzle.started": Schema.Struct({}),
  "puzzle.ended": Schema.Struct({}),
  "input.keyPressed": Schema.Struct({ pressedKey: Schema.String }),
  "hack.useRequested": Schema.Struct({ overdriveHackId: OverdriveHackId }),
};

export type Events = EventUnion<typeof Events>;

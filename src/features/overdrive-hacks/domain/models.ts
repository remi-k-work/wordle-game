// services, features, and other libraries
import { Schema } from "effect";
import { Letter } from "@/features/game/domain/models";

// types
export type OverdriveHackId = typeof OverdriveHackId.Type;
export type SonarReveal = typeof SonarReveal.Type;

export const OverdriveHackId = Schema.Literals(["emp", "sonar", "override"]);
export const SonarReveal = Schema.Struct({ vowel: Letter, positions: Schema.Array(Schema.Natural) });

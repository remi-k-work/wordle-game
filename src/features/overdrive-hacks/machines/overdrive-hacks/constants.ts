// services, features, and other libraries
import { Array, Option } from "effect";

// types
import type { Letter } from "@/features/game/domain/models";
import type { SonarReveal } from "@/features/overdrive-hacks/domain/models";
import type { OverdriveHacks } from "./models";

// A factory rather than a shared constant, the value becomes the machine's
// live context, so a module global would be aliased into every running game
export const INITIAL_OVERDRIVE_HACKS = () =>
  ({
    empNukedLetters: Array.empty<Letter>(),
    sonarReveals: Array.empty<SonarReveal>(),
    theOverride: Option.none(),
    theOverrideAudio: Option.none(),
  }) as const satisfies OverdriveHacks;

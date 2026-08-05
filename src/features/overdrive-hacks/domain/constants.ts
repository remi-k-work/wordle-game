// services, features, and other libraries
import { Option } from "effect";

// types
import type { SolutionsLanguage } from "@/features/game/domain";
import type { OverdriveHackId, OverdriveHacks } from ".";

// constants
export const EMP_COST = 0; //1500;
export const EMP_LETTER_COUNT = 3;
export const SONAR_COST = 0; //2000;
export const OVERRIDE_COST = 3000;

export const OVERDRIVE_HACK_COSTS = { emp: EMP_COST, sonar: SONAR_COST, override: OVERRIDE_COST } as const satisfies Readonly<Record<OverdriveHackId, number>>;
export const OVERDRIVE_HACK_COST = (hackId: OverdriveHackId) => OVERDRIVE_HACK_COSTS[hackId];

export const VOWELS_BY_LANGUAGE = {
  En: ["A", "E", "I", "O", "U"],
  Pl: ["A", "Ą", "E", "Ę", "I", "O", "Ó", "U", "Y"],
} as const satisfies Readonly<Record<SolutionsLanguage, readonly string[]>>;

export const INITIAL_OVERDRIVE_HACKS = {
  pendingEffect: Option.none(),
  empNukedLetters: [],
  sonarReveals: [],
  theOverride: Option.none(),
} as const satisfies OverdriveHacks;

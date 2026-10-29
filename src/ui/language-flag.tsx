// services, features, and other libraries
import { Match } from "effect";

// assets
import { PlFlagIcon } from "@/assets/icons/pl-flag";
import { UsFlagIcon } from "@/assets/icons/us-flag";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// A shared language flag for the game vocabulary (En/Pl); centralises the
// En/Pl → flag icon mapping so the game-language toggle and the top-10 table
// stay in sync without repeating the same Match logic in each consumer
export function LanguageFlag({ solutionsLanguage, className }: { solutionsLanguage: SolutionsLanguage; className?: string }) {
  return Match.value(solutionsLanguage).pipe(
    Match.when("En", () => <UsFlagIcon className={className} />),
    Match.when("Pl", () => <PlFlagIcon className={className} />),
    Match.exhaustive
  );
}

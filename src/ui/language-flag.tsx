// services, features, and other libraries
import { matchLanguage } from "@/features/game/domain/helpers";

// assets
import { PlFlagIcon } from "@/assets/icons/pl-flag";
import { UsFlagIcon } from "@/assets/icons/us-flag";

// types
import type { SolutionsLanguage } from "@/features/game/domain/models";

// A shared language flag for the game vocabulary (En/Pl); centralises the
// En/Pl → flag icon mapping so the game-language toggle and the top-10 table
// stay in sync without repeating the same lookup logic in each consumer
export function LanguageFlag({ solutionsLanguage, className }: { solutionsLanguage: SolutionsLanguage; className?: string }) {
  return matchLanguage(solutionsLanguage, <UsFlagIcon className={className} />, <PlFlagIcon className={className} />);
}

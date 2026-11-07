// services, features, and other libraries
import { useLocale } from "gt-tanstack-start";
import { T, Var } from "gt-react";

// components
import { HackBadge } from "./hack-badge";

// types
import type { OverdriveHackId } from "@/features/overdrive-hacks/domain/models";

interface HackCostProps {
  hackId: OverdriveHackId;
}

// constants
import { OVERDRIVE_HACK_COST } from "@/features/overdrive-hacks/domain/constants";

// What a hack costs, in the one form the menu shows it: "−N pts" in a
// destructive badge. The two purchasable rows (emp, sonar, and the AI Override
// before it is claimed) state this concept identically, so the price, its sign,
// its unit, and the locale it is formatted in live here once.
// Reading the locale inside the badge also keeps the cost's formatting out of the
// row itself, so a locale change repaints the badge rather than the whole menu
export function HackCost({ hackId }: HackCostProps) {
  const locale = useLocale();

  return (
    <HackBadge tone="cost">
      <Var>-{OVERDRIVE_HACK_COST(hackId).toLocaleString(locale)}</Var> <T>pts</T>
    </HackBadge>
  );
}

// react
import { useTransition } from "react";

// tanstack
import { useRouter } from "@tanstack/react-router";

// services, features, and other libraries
import { motion, AnimatePresence } from "motion/react";
import { useGT } from "gt-react";
import { useLocale, useSetLocale } from "gt-tanstack-start";

// components
import { Button } from "@base-ui/react/button";

// assets
import { UsFlagIcon } from "@/assets/icons/us-flag";
import { PlFlagIcon } from "@/assets/icons/pl-flag";

// constants
import { ICON_SWAP_MOTION } from "@/lib/motion-tokens";

const MotionUsFlagIcon = motion.create(UsFlagIcon);
const MotionPlFlagIcon = motion.create(PlFlagIcon);

// Switches the website locale (UI copy, route data); the game's vocabulary language has its own switch in the game menu/toolbar
export function SiteLangChanger() {
  const gt = useGT();
  const locale = useLocale();
  const setLocale = useSetLocale();

  // To display a pending status while the locale swap reloads the route data
  const [isPending, startTransition] = useTransition();

  // To be able to re-run the loaders softly instead of a full page reload
  const router = useRouter();

  // Any locale this app does not ship a flag for falls back to the English one,
  // which is what the non-Polish side of this choice already expresses
  const isPolish = locale === "pl";

  function handleLangToggled() {
    startTransition(async () => {
      setLocale(locale === "en" ? "pl" : "en");
      await router.invalidate();
    });
  }

  // The icon shows the locale the control switches *to*, and the key is what
  // tells `AnimatePresence mode="wait"` the incoming flag from the outgoing one.
  // Both are picked here — the same way `ThemeChanger` picks its icon and key —
  // rather than being restated inside two JSX branches: the branches only decide
  // which flag is on screen, so the two elements stay identical apart from that
  const LocaleIcon = isPolish ? MotionPlFlagIcon : MotionUsFlagIcon;
  const localeIconKey = isPolish ? "pl" : "en";

  return (
    <Button className="button p-1" title={gt("Select Website Language")} disabled={isPending} onClick={handleLangToggled}>
      <AnimatePresence mode="wait" initial={false}>
        <LocaleIcon key={localeIconKey} className="size-11" {...ICON_SWAP_MOTION} />
      </AnimatePresence>
    </Button>
  );
}

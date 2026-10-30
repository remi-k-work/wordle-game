// react
import { useTransition } from "react";

// tanstack
import { useRouter } from "@tanstack/react-router";

// services, features, and other libraries
import { Option, Record } from "effect";
import { motion, AnimatePresence } from "motion/react";
import { useGT } from "gt-react";
import { useLocale, useSetLocale } from "gt-tanstack-start";

// components
import { Button } from "@base-ui/react/button";

// assets
import { UsFlagIcon } from "@/assets/icons/us-flag";
import { PlFlagIcon } from "@/assets/icons/pl-flag";

// types
import { ReactNode } from "react";

// constants
import { springs } from "@/lib/motion-tokens";

const MotionUsFlagIcon = motion.create(UsFlagIcon);
const MotionPlFlagIcon = motion.create(PlFlagIcon);

const LOCALE_FLAGS: Record.ReadonlyRecord<string, ReactNode> = Record.fromEntries([
  [
    "en",
    <MotionUsFlagIcon
      key="en"
      className="size-11"
      initial={{ opacity: 0, rotate: -90 }}
      animate={{ opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, rotate: 90 }}
      transition={springs.snappy}
    />,
  ],
  [
    "pl",
    <MotionPlFlagIcon
      key="pl"
      className="size-11"
      initial={{ opacity: 0, rotate: -90 }}
      animate={{ opacity: 1, rotate: 0 }}
      exit={{ opacity: 0, rotate: 90 }}
      transition={springs.snappy}
    />,
  ],
]);

// Switches the website locale (UI copy, route data); the game's vocabulary language has its own switch in the game menu/toolbar
export function SiteLangChanger() {
  const gt = useGT();
  const locale = useLocale();
  const setLocale = useSetLocale();

  // To display a pending status while the locale swap reloads the route data
  const [isPending, startTransition] = useTransition();

  // To be able to re-run the loaders softly instead of a full page reload
  const router = useRouter();

  function handleLangToggled() {
    startTransition(async () => {
      setLocale(locale === "en" ? "pl" : "en");
      await router.invalidate();
    });
  }

  return (
    <Button className="button p-1" title={gt("Select Website Language")} disabled={isPending} onClick={handleLangToggled}>
      <AnimatePresence mode="wait" initial={false}>
        {Record.get(LOCALE_FLAGS, locale).pipe(
          Option.orElse(() => Record.get(LOCALE_FLAGS, "en")),
          Option.getOrUndefined
        )}
      </AnimatePresence>
    </Button>
  );
}

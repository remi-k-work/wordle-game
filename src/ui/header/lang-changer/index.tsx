// react
import { useTransition } from "react";

// tanstack
import { useRouter } from "@tanstack/react-router";

// services, features, and other libraries
import { motion, AnimatePresence } from "motion/react";
import { useGT, useLocale, useSetLocale } from "gt-tanstack-start";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon } from "@/assets/icons/pl-flag";
import { UsFlagIcon } from "@/assets/icons/us-flag";

// constants
import { springs } from "@/lib/motion-tokens";

const MotionPlFlagIcon = motion.create(PlFlagIcon);
const MotionUsFlagIcon = motion.create(UsFlagIcon);

export function LangChanger() {
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
      // The initialGT `_reload` no-op defers to a soft router invalidation that
      // re-runs the loaders (the root one re-ships the translation snapshot)
      await router.invalidate();
    });
  }

  return (
    <Button className="button p-1" title={gt("Select Website Language")} disabled={isPending} onClick={handleLangToggled}>
      {/* The flag flips over to the other language instead of swapping out from under the pointer;
          `initial={false}` keeps the server markup (and the hydration render) free of any rotation */}
      <AnimatePresence mode="wait" initial={false}>
        {locale === "en" ? (
          <MotionUsFlagIcon
            key="en"
            className="size-11"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={springs.snappy}
          />
        ) : (
          <MotionPlFlagIcon
            key="pl"
            className="size-11"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={springs.snappy}
          />
        )}
      </AnimatePresence>
    </Button>
  );
}

export function LangChangerSkeleton() {
  const gt = useGT();

  return (
    <Button className="button p-1" title={gt("Select Website Language")} disabled>
      <div className="size-11 animate-pulse bg-accent" />
    </Button>
  );
}

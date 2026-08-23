"use client";

// services, features, and other libraries
import { motion, AnimatePresence } from "motion/react";
import { useGT, useLocaleSelector } from "gt-next";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

// constants
import { springs } from "@/lib/motion-tokens";

const MotionPlFlagIcon = motion.create(PlFlagIcon);
const MotionUsFlagIcon = motion.create(UsFlagIcon);

export function LangChanger() {
  const gt = useGT();
  const { locale, setLocale } = useLocaleSelector();

  return (
    <Button className="button p-1" title={gt("Select website language")} onClick={() => setLocale(locale === "en" ? "pl" : "en")}>
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
    <Button className="button p-1" title={gt("Select website language")} disabled>
      <div className="size-11 animate-pulse bg-accent" />
    </Button>
  );
}

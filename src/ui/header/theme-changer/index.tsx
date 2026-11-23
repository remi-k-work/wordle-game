// tanstack
import { ClientOnly } from "@tanstack/react-router";

// services, features, and other libraries
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

// assets
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

// constants
import { ICON_SWAP_MOTION } from "@/lib/motion-tokens";

const MotionMoonIcon = motion.create(MoonIcon);
const MotionSunIcon = motion.create(SunIcon);

export function ThemeChanger() {
  // Determine whether the current theme is dark or light
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const gt = useGT();

  const ThemeIcon = isDarkMode ? MotionSunIcon : MotionMoonIcon;
  const themeIconKey = isDarkMode ? "light" : "dark";

  return (
    <ClientOnly fallback={<ThemeChangerSkeleton />}>
      <Button className="button p-1" title={isDarkMode ? gt("Light Mode") : gt("Dark Mode")} onClick={() => setTheme(isDarkMode ? "light" : "dark")}>
        <AnimatePresence mode="wait" initial={false}>
          <ThemeIcon key={themeIconKey} className="size-11" {...ICON_SWAP_MOTION} />
        </AnimatePresence>
      </Button>
    </ClientOnly>
  );
}

export function ThemeChangerSkeleton() {
  const gt = useGT();

  return (
    <Button className="button p-1" title={gt("Change Theme")} disabled>
      <SunIcon className="size-11" />
    </Button>
  );
}

// services, features, and other libraries
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

// assets
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

// constants
import { springs } from "@/lib/motion-tokens";

const MotionMoonIcon = motion.create(MoonIcon);
const MotionSunIcon = motion.create(SunIcon);

export default function ThemeChanger() {
  // Determine whether the current theme is dark or light
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const gt = useGT();

  return (
    <Button className="button p-1" title={isDarkMode ? gt("Light Mode") : gt("Dark Mode")} onClick={() => setTheme(isDarkMode ? "light" : "dark")}>
      <AnimatePresence mode="wait" initial={false}>
        {isDarkMode ? (
          <MotionSunIcon
            key="light"
            className="size-11"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={springs.snappy}
          />
        ) : (
          <MotionMoonIcon
            key="dark"
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

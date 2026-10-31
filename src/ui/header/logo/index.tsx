// tanstack
import { Link } from "@tanstack/react-router";

// services, features, and other libraries
import { motion } from "motion/react";
import { useGT } from "gt-react";

// assets
import { LogoIcon } from "@/assets/icons/logo";

// constants
import { MOTION_TOKENS, SPRINGS } from "@/lib/motion-tokens";

const MotionLink = motion.create(Link);

export function Logo() {
  const gt = useGT();

  return (
    <MotionLink
      className="flex-none"
      to="/"
      title={gt("Wordle Overdrive")}
      whileHover={{ rotate: -6, scale: MOTION_TOKENS.scale.pop }}
      transition={SPRINGS.snappy}
    >
      <LogoIcon className="size-11 sm:size-13" />
    </MotionLink>
  );
}

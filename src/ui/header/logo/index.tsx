// tanstack
import { Link } from "@tanstack/react-router";

// services, features, and other libraries
import { motion } from "motion/react";
import { useGT } from "gt-tanstack-start";

// assets
import { LogoIcon } from "@/assets/icons/logo";

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

const MotionLink = motion.create(Link);

export default function Logo() {
  const gt = useGT();

  return (
    <MotionLink
      className="flex-none"
      to="/"
      title={gt("Wordle Overdrive")}
      whileHover={{ rotate: -6, scale: motionTokens.scale.pop }}
      transition={springs.snappy}
    >
      <LogoIcon className="size-11 sm:size-13" />
    </MotionLink>
  );
}

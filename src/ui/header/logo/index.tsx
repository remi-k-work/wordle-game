"use client";

// next
import Link from "next/link";

// services, features, and other libraries
import { motion } from "motion/react";

// assets
import { LogoIcon } from "@/assets/icons";

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

const MotionLink = motion.create(Link);

export default function Logo() {
  return (
    <MotionLink className="flex-none" href="/" title="Wordle Overdrive" whileHover={{ rotate: -6, scale: motionTokens.scale.pop }} transition={springs.snappy}>
      <LogoIcon className="size-13" />
    </MotionLink>
  );
}

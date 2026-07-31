"use client";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

// components
import { RevealTitle } from "@/ui/reveal-title";

// types
interface PageHeaderProps {
  title: string;
  description: string;
}

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <>
      <RevealTitle
        className={cn("mt-4 bg-linear-to-r from-surface-1 via-surface-3 to-surface-1 p-3 font-sans text-xl", "sm:text-3xl lg:text-4xl")}
        title={title}
      />
      <motion.p
        initial={{ opacity: 0, y: motionTokens.distance.sm }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springs.gentle, delay: motionTokens.duration.slow }}
        className={cn("mb-8 bg-linear-to-r from-secondary to-surface-1 p-3 font-sans text-lg", "sm:text-2xl lg:text-3xl")}
      >
        {description}
      </motion.p>
    </>
  );
}

export function PageHeaderSkeleton({ title, description }: PageHeaderProps) {
  return (
    <>
      <h1 className={cn("mt-4 bg-linear-to-r from-surface-1 via-surface-3 to-surface-1 p-3 font-sans text-xl", "sm:text-3xl lg:text-4xl")}>{title}</h1>
      <p className={cn("mb-8 bg-linear-to-r from-secondary to-surface-1 p-3 font-sans text-lg", "sm:text-2xl lg:text-3xl")}>{description}</p>
    </>
  );
}

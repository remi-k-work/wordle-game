"use client";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useMessages } from "gt-next";

// types
interface SectionHeaderProps {
  title: string;
}

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

export function SectionHeader({ title }: SectionHeaderProps) {
  const messages = useMessages();

  return (
    <motion.h2
      initial={{ opacity: 0, y: motionTokens.distance.md }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={springs.gentle}
      className={cn("my-8 bg-linear-to-r from-secondary to-surface-1 p-3 font-sans text-lg", "sm:text-2xl lg:text-3xl")}
    >
      {messages(title)}
    </motion.h2>
  );
}

export function SectionHeaderSkeleton({ title }: SectionHeaderProps) {
  return <h2 className={cn("my-8 bg-linear-to-r from-secondary to-surface-1 p-3 font-sans text-lg", "sm:text-2xl lg:text-3xl")}>{title}</h2>;
}

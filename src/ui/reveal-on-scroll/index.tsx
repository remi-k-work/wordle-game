"use client";

// services, features, and other libraries
import { motion } from "motion/react";

// types
import type { ReactNode } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  staggerChildren?: boolean;
}

// constants
import { motionTokens, springs } from "@/lib/motion-tokens";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: motionTokens.duration.normal } },
};

const itemVariants = {
  hidden: { opacity: 0, y: motionTokens.distance.md },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
};

export function RevealOnScroll({ children, staggerChildren = false }: RevealOnScrollProps) {
  if (staggerChildren) {
    const arr = Array.isArray(children) ? children : [children];

    return (
      <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        {arr.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: motionTokens.distance.md }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={springs.gentle}
    >
      {children}
    </motion.div>
  );
}

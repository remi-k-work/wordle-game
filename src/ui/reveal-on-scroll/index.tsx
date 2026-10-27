// react
import { Children, isValidElement } from "react";

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

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: motionTokens.duration.normal } },
} as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: motionTokens.distance.md },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
} as const;

export function RevealOnScroll({ children, staggerChildren = false }: RevealOnScrollProps) {
  if (staggerChildren) {
    const childList = Children.toArray(children);

    return (
      <motion.div variants={CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        {childList.map((child, index) => (
          <motion.div key={isValidElement(child) && child.key !== null ? child.key : index} variants={ITEM_VARIANTS}>
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

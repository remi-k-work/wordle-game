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
import { MOTION_TOKENS, SPRINGS } from "@/lib/motion-tokens";

const CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: MOTION_TOKENS.duration.normal } },
} as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: MOTION_TOKENS.distance.md },
  visible: { opacity: 1, y: 0, transition: SPRINGS.gentle },
} as const;

// `Children.toArray` already flattens fragments and assigns every element a
// unique key, so an element always keeps the key it had; only plain text
// children (which cannot carry one) fall back to their position
const childKey = (child: ReactNode, index: number) => (isValidElement(child) ? child.key : index);

export function RevealOnScroll({ children, staggerChildren = false }: RevealOnScrollProps) {
  if (staggerChildren) {
    const childList = Children.toArray(children);

    return (
      <motion.div variants={CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        {childList.map((child, index) => (
          <motion.div key={childKey(child, index)} variants={ITEM_VARIANTS}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: MOTION_TOKENS.distance.md }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={SPRINGS.gentle}
    >
      {children}
    </motion.div>
  );
}

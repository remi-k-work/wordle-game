// services, features, and other libraries
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useMessages } from "gt-react";

// components
import { RevealTitle } from "@/ui/reveal-title";

// types
interface PageHeaderProps {
  title: string;
  description: string;
}

// constants
import { MOTION_TOKENS, SPRINGS } from "@/lib/motion-tokens";

export function PageHeader({ title, description }: PageHeaderProps) {
  const messages = useMessages();

  return (
    <>
      <RevealTitle
        className={cn("mt-4 bg-linear-to-r from-surface-1 via-surface-3 to-surface-1 p-3 font-sans text-xl", "sm:text-3xl lg:text-4xl")}
        title={messages(title)}
      />
      <motion.p
        initial={{ opacity: 0, y: MOTION_TOKENS.distance.sm }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRINGS.gentle, delay: MOTION_TOKENS.duration.slow }}
        className={cn("mb-8 bg-linear-to-r from-secondary to-surface-1 p-3 font-sans text-lg", "sm:text-2xl lg:text-3xl")}
      >
        {messages(description)}
      </motion.p>
    </>
  );
}

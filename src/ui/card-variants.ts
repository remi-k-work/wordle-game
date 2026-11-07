// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
export type CardTag = "header" | "footer" | "section" | "div" | "article";
export type CardVariant = "primary" | "secondary";

// constants
export const CARD_VARIANT_STYLES = { primary: cn("border-primary text-primary"), secondary: cn("border-secondary text-secondary") } as const;

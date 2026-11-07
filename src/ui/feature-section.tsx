// components
import { SectionHeader } from "@/ui/section-header";
import { RevealOnScroll } from "@/ui/reveal-on-scroll";

// types
import type { ReactNode } from "react";

interface FeatureSectionProps {
  title: string;
  src: string;
  // Describes the illustration; falls back to the section's own title
  alt?: string;
  staggerChildren?: boolean;
  children: ReactNode;
}

// A revealed feature block: a scroll-revealed heading, illustration, and body content
export function FeatureSection({ title, src, alt = title, staggerChildren = false, children }: FeatureSectionProps) {
  return (
    <RevealOnScroll staggerChildren={staggerChildren}>
      <SectionHeader title={title} />
      <img src={src} loading="lazy" alt={alt} className="mx-auto h-auto w-full max-w-379" />
      <br />
      {children}
    </RevealOnScroll>
  );
}

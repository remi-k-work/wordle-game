// components
import { SectionHeader } from "@/ui/section-header";
import { RevealOnScroll } from "@/ui/reveal-on-scroll";

// types
import type { ReactNode } from "react";

interface FeatureSectionProps {
  title: string;
  src: string;
  alt: string;
  staggerChildren?: boolean;
  children: ReactNode;
}

// A revealed feature block: a scroll-revealed heading, illustration, and body
// content; shared by the three feature sections on the home page so the
// RevealOnScroll > SectionHeader > image scaffolding is defined once and the
// main structure reads as "three feature blocks" instead of repeating markup
// Hoisted to module scope (outside `Home`) so its component identity is stable
// across `Home` re-renders — defining it inside `Home` would remount the entire
// feature-block subtree (motion RevealOnScroll, images, text) on every render
export function FeatureSection({ title, src, alt, staggerChildren = false, children }: FeatureSectionProps) {
  return (
    <RevealOnScroll staggerChildren={staggerChildren}>
      <SectionHeader title={title} />
      <img src={src} loading="lazy" alt={alt} className="mx-auto h-auto w-full max-w-379" />
      <br />
      {children}
    </RevealOnScroll>
  );
}

// types
import type { ReactNode } from "react";

interface FeatureTextProps {
  children: ReactNode;
}

// Body text paragraph within a feature section: shared paragraph styling used by all three feature blocks
// Callers wrap this component in <T> at the call site because GT only extracts literal JSX children:
// a shared translation wrapper around a dynamic `children` prop cannot be statically analyzed
export function FeatureText({ children }: FeatureTextProps) {
  return <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">{children}</p>;
}

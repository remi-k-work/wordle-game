// services, features, and other libraries
import { T } from "gt-react";

// types
import type { ReactNode } from "react";

interface FeatureTextProps {
  children: ReactNode;
}

// Body text paragraph within a feature section: shared translation wrapper + paragraph styling used by all three feature blocks
export function FeatureText({ children }: FeatureTextProps) {
  return (
    <T>
      <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">{children}</p>
    </T>
  );
}

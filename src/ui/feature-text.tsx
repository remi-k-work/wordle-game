// services, features, and other libraries
import { T } from "gt-react";

// types
import type { ReactNode } from "react";

interface FeatureTextProps {
  children: ReactNode;
}

// Body text paragraph within a feature section: shared translation wrapper +
// paragraph styling used by all three feature blocks; extracted so the
// className and `<T><p>` wrapper are defined once instead of repeated for every
// paragraph across the three sections
export function FeatureText({ children }: FeatureTextProps) {
  return (
    <T>
      <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">{children}</p>
    </T>
  );
}

// types
import type { ReactNode } from "react";

interface ResponsiveLabelProps {
  keepText?: boolean;
  children: ReactNode;
}

// A toolbar label that collapses to its icon alone on small screens
export function ResponsiveLabel({ keepText = false, children }: ResponsiveLabelProps) {
  if (keepText) return <>{children}</>;

  return <span className="hidden sm:block">{children}</span>;
}

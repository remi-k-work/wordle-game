// types
import type { ReactNode } from "react";

interface FlowLabelProps {
  keepText?: boolean;
  children: ReactNode;
}

export function FlowLabel({ keepText = false, children }: FlowLabelProps) {
  if (keepText) return <>{children}</>;
  return <span className="hidden sm:block">{children}</span>;
}

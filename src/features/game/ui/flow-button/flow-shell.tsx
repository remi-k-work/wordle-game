// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Button } from "@base-ui/react";
import { FlowLabel } from "./flow-label";

// types
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface FlowShellProps extends ComponentPropsWithoutRef<typeof Button> {
  keepText?: boolean;
  title: string;
  icon: ReactNode;
  label: ReactNode;
}

export function FlowShell({ className, keepText = false, title, icon, label, ...rest }: FlowShellProps) {
  return (
    <Button className={cn("button", !keepText && "max-sm:p-1", className)} title={title} {...rest}>
      {icon}
      <FlowLabel keepText={keepText}>{label}</FlowLabel>
    </Button>
  );
}

// components
import { Button } from "@base-ui/react/button";

// types
import type { ComponentType, ReactNode } from "react";

interface HackActionProps {
  Icon: ComponentType<{ className?: string }>;
  label: ReactNode;
  badge: ReactNode;
  disabled?: boolean;
  onClicked: () => void;
}

// One row of the hacks menu: icon | label | badge; the emp/sonar entries and both AI Override states all render this same shape
export function HackAction({ Icon, label, badge, disabled = false, onClicked }: HackActionProps) {
  return (
    <Button className="button grid grid-cols-[auto_1fr_1fr]" disabled={disabled} onClick={onClicked}>
      <Icon className="size-11" />
      <span className="justify-self-start">{label}</span>
      {badge}
    </Button>
  );
}

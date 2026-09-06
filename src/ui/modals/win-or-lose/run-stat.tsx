// types
import type { ComponentType, ReactNode } from "react";

interface RunStatProps {
  label: ReactNode;
  bg: string;
  Icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  children: ReactNode;
}

export function RunStat({ label, bg, Icon, iconClassName, children }: RunStatProps) {
  return (
    <div className={bg}>
      <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">{label}</h3>
      <span className={`flex items-center justify-center gap-1 text-3xl font-semibold wrap-anywhere ${iconClassName}`}>
        <Icon className="size-7" />
        {children}
      </span>
    </div>
  );
}

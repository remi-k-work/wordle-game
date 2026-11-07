// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

// assets
import { NextIcon } from "@/assets/icons/next";

// types
interface NextProps {
  disabled: boolean;
  onNext: () => void;
}

export function Next({ disabled, onNext }: NextProps) {
  const gt = useGT();

  // The tooltip and the accessible name are the same message, so it is resolved
  // once instead of being translated twice per button per slider render (the same
  // shape `Dot` uses for its own label)
  const label = gt("Next Chart");

  return (
    <Button className="button p-1" title={label} aria-label={label} disabled={disabled} onClick={onNext}>
      <NextIcon className="size-11" />
    </Button>
  );
}

export function NextSkeleton() {
  return (
    <Button className="button p-1" disabled>
      <NextIcon className="size-11" />
    </Button>
  );
}

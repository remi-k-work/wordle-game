// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

// assets
import { PrevIcon } from "@/assets/icons/prev";

// types
interface PrevProps {
  disabled: boolean;
  onPrev: () => void;
}

export function Prev({ disabled, onPrev }: PrevProps) {
  const gt = useGT();

  // The tooltip and the accessible name are the same message, so it is resolved
  // once instead of being translated twice per button per slider render (the same
  // shape `Dot` uses for its own label)
  const label = gt("Previous Chart");

  return (
    <Button className="button p-1" title={label} aria-label={label} disabled={disabled} onClick={onPrev}>
      <PrevIcon className="size-11" />
    </Button>
  );
}

export function PrevSkeleton() {
  return (
    <Button className="button p-1" disabled>
      <PrevIcon className="size-11" />
    </Button>
  );
}

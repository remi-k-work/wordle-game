// components
import { Button } from "@base-ui/react/button";
import { useGT } from "gt-tanstack-start";

// assets
import { PrevIcon } from "@/assets/icons/prev";

// types
interface PrevProps {
  disabled: boolean;
  onPrev: () => void;
}

export function Prev({ disabled, onPrev }: PrevProps) {
  const gt = useGT();

  return (
    <Button className="button p-1" title={gt("Previous Chart")} aria-label={gt("Previous Chart")} disabled={disabled} onClick={onPrev}>
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

// components
import { Button } from "@base-ui/react";
import { useGT } from "gt-next";

// assets
import { NextIcon } from "@/assets/icons";

interface NextProps {
  disabled: boolean;
  onNext: () => void;
}

export function Next({ disabled, onNext }: NextProps) {
  const gt = useGT();

  return (
    <Button className="button p-1" title={gt("Next Chart")} aria-label={gt("Next Chart")} disabled={disabled} onClick={onNext}>
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

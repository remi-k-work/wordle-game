// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

// assets
import { ViewfinderCircleIcon as ViewfinderCircleIconS } from "@heroicons/react/24/solid";
import { ViewfinderCircleIcon as ViewfinderCircleIconO } from "@heroicons/react/24/outline";

// types
interface DotProps {
  index: number;
  selected: boolean;
  onSelect: () => void;
}

export function Dot({ index, selected, onSelect }: DotProps) {
  const gt = useGT();

  return (
    <Button
      className={cn("button bg-secondary p-0", selected && "bg-accent")}
      title={gt("Go to Chart {index}", { index: index + 1 })}
      aria-label={gt("Go to Chart {index}", { index: index + 1 })}
      onClick={onSelect}
    >
      {selected ? <ViewfinderCircleIconS className="size-11" /> : <ViewfinderCircleIconO className="size-11" />}
    </Button>
  );
}

export function DotSkeleton() {
  return (
    <Button className="button bg-secondary p-0" disabled>
      <ViewfinderCircleIconO className="size-11" />
    </Button>
  );
}

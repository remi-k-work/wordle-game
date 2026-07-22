// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useBrowseCharts } from "@/features/telemetry/hooks";

// components
import { Switch } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

export function BrowseCharts() {
  const { sl, browseChartsMachineEvent } = useBrowseCharts();

  return (
    <h2 className="mt-4 flex max-w-none items-center justify-between gap-3 bg-linear-to-r from-surface-1 via-surface-3 to-surface-1 p-3 font-sans text-xl leading-none sm:text-3xl lg:text-4xl">
      Game Charts
      <label className="flex items-center gap-3">
        <UsFlagIcon className="mx-auto size-11" />
        <Switch.Root
          className={cn(
            "flex w-20 shrink-0 border bg-surface-2 py-1 pl-1",
            "transition-colors duration-300 ease-in-out",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
            "data-checked:bg-surface-3"
          )}
          name="browseChartsSl"
          aria-label="browseChartsSl"
          title="Switch Solutions Language for Charts"
          checked={sl === "Pl"}
          onCheckedChange={(isPl) => browseChartsMachineEvent({ type: "slChanged", sl: isPl ? "Pl" : "En" })}
        >
          <Switch.Thumb className={cn("size-9 bg-primary", "transition-[translate] duration-300 ease-in-out", "data-checked:translate-x-full")} />
        </Switch.Root>
        <PlFlagIcon className="mx-auto size-11" />
      </label>
    </h2>
  );
}

export function BrowseChartsSkeleton() {
  return (
    <h2 className="mt-4 flex max-w-none items-center justify-between gap-3 bg-linear-to-r from-surface-1 via-surface-3 to-surface-1 p-3 font-sans text-xl leading-none sm:text-3xl lg:text-4xl">
      Game Charts
      <label className="flex items-center gap-3">
        <UsFlagIcon className="mx-auto size-11" />
        <Switch.Root
          className={cn(
            "flex w-20 shrink-0 border bg-surface-2 py-1 pl-1",
            "transition-colors duration-300 ease-in-out",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent",
            "data-checked:bg-surface-3"
          )}
          name="browseChartsSl"
          aria-label="browseChartsSl"
          title="Switch Solutions Language for Charts"
          checked={false}
          onCheckedChange={() => {}}
          disabled
        >
          <Switch.Thumb className={cn("size-9 bg-primary", "transition-[translate] duration-300 ease-in-out", "data-checked:translate-x-full")} />
        </Switch.Root>
        <PlFlagIcon className="mx-auto size-11" />
      </label>
    </h2>
  );
}

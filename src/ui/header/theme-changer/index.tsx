// react
import { Suspense, lazy } from "react";

// tanstack
import { ClientOnly } from "@tanstack/react-router";

// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

const ThemeChangerChunk = lazy(() => import("./theme-changer"));

// assets
import { SunIcon } from "@heroicons/react/24/outline";

export function ThemeChanger() {
  return (
    <ClientOnly fallback={<ThemeChangerSkeleton />}>
      {/* Suspense owns the chunk-loading window. `ClientOnly` only swaps the
          server/no-JS fallback for the real children — it renders no boundary,
          and `lazy()` requires one: without it, the first mount after hydration
          suspends with nothing above it to catch the suspension */}
      <Suspense fallback={<ThemeChangerSkeleton />}>
        <ThemeChangerChunk />
      </Suspense>
    </ClientOnly>
  );
}

export function ThemeChangerSkeleton() {
  const gt = useGT();

  return (
    <Button className="button p-1" title={gt("Change Theme")} disabled>
      <SunIcon className="size-11" />
    </Button>
  );
}

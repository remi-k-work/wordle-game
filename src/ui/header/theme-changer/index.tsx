"use client";

// react
import { Suspense, lazy } from "react";

// components
import { Button } from "@base-ui/react";
import { SunIcon } from "@heroicons/react/24/outline";
import { useGT } from "gt-tanstack-start";

const ThemeChangerChunk = lazy(() => import("./theme-changer"));

export function ThemeChanger() {
  // Client-only toggle: next-themes resolves nothing on the server, so the shell
  // renders the disabled skeleton and the swap happens after hydration / chunk load
  if (typeof window === "undefined") return <ThemeChangerSkeleton />;

  return (
    <Suspense fallback={<ThemeChangerSkeleton />}>
      <ThemeChangerChunk />
    </Suspense>
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

// react
import { Suspense, lazy } from "react";

// services, features, and other libraries
import { useGT } from "gt-react";

// components
import { Button } from "@base-ui/react/button";

const ThemeChangerChunk = lazy(() => import("./theme-changer"));

// assets
import { SunIcon } from "@heroicons/react/24/outline";

// `Suspense` alone handles both SSR and lazy loading: on the server it renders
// the fallback without executing the lazy chunk (so `next-themes`' `useTheme`
// never runs during SSR); on the client it shows the fallback while the chunk
// loads, then swaps in the content; wrapping it in `ClientOnly` too created a
// second, redundant boundary — the skeleton remounted/flashed once before the
// real content appeared
export function ThemeChanger() {
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

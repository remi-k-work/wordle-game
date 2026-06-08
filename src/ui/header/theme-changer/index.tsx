"use client";

// next
import dynamic from "next/dynamic";

// components
import { Button } from "@base-ui/react";

// assets
import { SunIcon } from "@heroicons/react/24/outline";

export const ThemeChanger = dynamic(() => import("./theme-changer"), { ssr: false, loading: () => <ThemeChangerSkeleton /> });

export function ThemeChangerSkeleton() {
  return (
    <Button className="button p-1" title="Change Theme" disabled>
      <SunIcon className="size-11" />
    </Button>
  );
}

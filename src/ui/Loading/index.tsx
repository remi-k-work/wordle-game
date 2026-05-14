"use client";

// next
import dynamic from "next/dynamic";

// components
export const Loading = dynamic(() => import("./Loading"), { ssr: false, loading: () => <LoadingSkeleton /> });

// assets
import { SpinnerIcon } from "@/assets/icons";

export function LoadingSkeleton() {
  return (
    <article className="grid place-items-center">
      <h1 className="flex flex-col items-center gap-4 text-center text-4xl">
        <SpinnerIcon className="w-32" />
        Loading...
      </h1>
    </article>
  );
}

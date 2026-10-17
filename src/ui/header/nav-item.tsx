"use client";

// next
import { usePathname } from "next/navigation";
import Link from "next/link";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useMessages } from "gt-next";

// types
import type { Route } from "next";
import type { ReactNode } from "react";

// Module-level cache: nav patterns are static literals, so compile each one
// exactly once instead of on every render (js-cache-function-results /
// js-hoist-regexp). Non-global regexes are stateless, so sharing is safe
const patternCache = new Map<string, RegExp>();
const compilePattern = (match: string) => {
  let regex = patternCache.get(match);
  if (regex === undefined) {
    regex = new RegExp(match);
    patternCache.set(match, regex);
  }
  return regex;
};

export interface NavItemProps {
  href: Route;
  match: string;
  title: string;
  icon: ReactNode;
  isExternal?: boolean;
}

export default function NavItem({ href, match, title, icon, isExternal = false }: NavItemProps) {
  const pathname = usePathname();
  const messages = useMessages();

  // Test the cached pattern against the current pathname
  const isActive = compilePattern(match).test(pathname);

  return (
    <Link
      href={href}
      title={messages(title)}
      prefetch={!isExternal}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "border bg-secondary p-1",
        "[&>svg]:size-11",
        isActive ? "border-accent transition-colors [&>svg]:size-13" : "hover:scale-110 hover:border-accent"
      )}
    >
      {icon}
    </Link>
  );
}

export function NavItemSkeleton({ href, title, icon, isExternal = false }: NavItemProps) {
  return (
    <Link
      href={href}
      title={title}
      prefetch={!isExternal}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="border bg-secondary p-1 [&>svg]:size-11"
    >
      {icon}
    </Link>
  );
}

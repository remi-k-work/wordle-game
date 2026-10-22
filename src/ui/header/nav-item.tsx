// tanstack
import { Link, useRouterState } from "@tanstack/react-router";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useMessages } from "gt-tanstack-start";

// types
import type { ReactNode } from "react";
import type { LinkProps } from "@tanstack/react-router";

interface NavItemProps {
  href: LinkProps["to"];
  match: string;
  title: string;
  icon: ReactNode;
  isExternal?: boolean;
}

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

export function NavItem({ href, match, title, icon, isExternal = false }: NavItemProps) {
  const pathname = useRouterState({ select: ({ location }) => location.pathname });
  const messages = useMessages();

  // Test the cached pattern against the current pathname
  const isActive = compilePattern(match).test(pathname);

  return (
    <Link
      to={href}
      title={messages(title)}
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

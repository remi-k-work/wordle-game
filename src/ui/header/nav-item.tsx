// tanstack
import { Link, useRouterState } from "@tanstack/react-router";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useMessages } from "gt-react";

// types
import type { ReactNode } from "react";
import type { LinkProps } from "@tanstack/react-router";

interface NavItemProps {
  href: LinkProps["to"];
  match: string;
  title: string;
  icon: ReactNode;
}

// Route patterns are compiled once per pattern instead of on every render:
// `NavItem` subscribes to the router's pathname, so the comparison runs exactly
// when the pattern *would* otherwise be re-parsed — once per nav item per
// navigation. Reusing an existing `RegExp` for `.test()` is safe because none of
// these are global/`g` flagged, so `test` carries no `lastIndex` state.
const routeMatchers = new Map<string, RegExp>();

function matchesRoute(pattern: string, pathname: string) {
  let matcher = routeMatchers.get(pattern);

  if (matcher === undefined) {
    matcher = new RegExp(pattern);
    routeMatchers.set(pattern, matcher);
  }

  return matcher.test(pathname);
}

// Every nav item points at a route inside this app, so the link is always an
// in-app router link: no `target`/`rel` pair is rendered, and adding an external
// entry means adding it to `NAV_ITEMS` and these props together rather than
// leaving a prop here that no entry sets
export function NavItem({ href, match, title, icon }: NavItemProps) {
  const pathname = useRouterState({ select: ({ location }) => location.pathname });
  const messages = useMessages();

  const isActive = matchesRoute(match, pathname);

  return (
    <Link
      to={href}
      title={messages(title)}
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

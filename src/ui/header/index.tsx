// tanstack
import { useRouterState } from "@tanstack/react-router";

// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Logo } from "./logo";
import { SiteNav } from "./site-nav";

// constants
const HEADER_CLASSES = cn("z-10 flex items-center gap-1 bg-linear-to-b from-surface-1 via-surface-3 to-transparent p-1", "lg:sticky lg:top-0");

export function Header() {
  const pathname = useRouterState({ select: ({ location }) => location.pathname });
  if (pathname === "/game") return <header />;

  return (
    <header className={HEADER_CLASSES}>
      <Logo />
      <SiteNav className="flex flex-1 flex-wrap items-center justify-end gap-1 sm:gap-4" />
    </header>
  );
}

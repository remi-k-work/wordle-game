// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Logo } from "./logo";
import { NavItem } from "./nav-item";
import { ThemeChanger } from "./theme-changer";
import { SiteLangChanger } from "./lang-changer";

// constants
import { NAV_ITEMS } from "./constants";

// Fully synchronous shell: Logo/NavItem/SiteLangChanger are static imports and render
// in a single pass on both server and client (isomorphic execution model), so no
// Suspense wrapper is needed — only ThemeChanger defers, behind its own
// ClientOnly + Suspense boundary (see ./theme-changer)
export function Header() {
  return (
    <header className={cn("z-10 flex items-center gap-1 bg-linear-to-b from-surface-1 via-surface-3 to-transparent p-1", "lg:sticky lg:top-0")}>
      <Logo />
      <nav className="flex flex-1 flex-wrap items-center justify-end gap-1 sm:gap-4">
        {NAV_ITEMS.map((navItem) => (
          <NavItem key={navItem.href} {...navItem} />
        ))}
        <SiteLangChanger />
        <ThemeChanger />
      </nav>
    </header>
  );
}

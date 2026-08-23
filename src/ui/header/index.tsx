// react
import { Suspense } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import Logo from "./logo";
import NavItem, { NavItemSkeleton } from "./nav-item";
import { ThemeChanger, ThemeChangerSkeleton } from "./theme-changer";
import { LangChanger, LangChangerSkeleton } from "./lang-changer";

// constants
import { NAV_ITEMS } from "./constants";

// Component remains the fast, static shell
export function Header() {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderContent />
    </Suspense>
  );
}

// This new async component contains the dynamic logic
async function HeaderContent() {
  return (
    <header className={cn("z-10 flex items-center gap-4 bg-linear-to-b from-surface-1 via-surface-3 to-transparent p-2", "lg:sticky lg:top-0")}>
      <Logo />
      <nav className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-4">
        {NAV_ITEMS.map((navItem, index) => (
          <Suspense key={index} fallback={<NavItemSkeleton {...navItem} />}>
            <NavItem {...navItem} />
          </Suspense>
        ))}
        <LangChanger />
        <ThemeChanger />
      </nav>
    </header>
  );
}

export function HeaderSkeleton() {
  return (
    <header className={cn("z-10 flex items-center gap-4 bg-linear-to-b from-surface-1 via-surface-3 to-transparent p-2", "lg:sticky lg:top-0")}>
      <Logo />
      <nav className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:gap-4">
        {NAV_ITEMS.map((navItem, index) => (
          <NavItemSkeleton key={index} {...navItem} />
        ))}
        <LangChangerSkeleton />
        <ThemeChangerSkeleton />
      </nav>
    </header>
  );
}

// components
import { NavItem } from "./nav-item";
import { ThemeChanger } from "./theme-changer";
import { SiteLangChanger } from "./lang-changer";

// types
interface SiteNavProps {
  className: string;
}

// constants
import { NAV_ITEMS } from "./constants";

// The site-level controls: route links plus the website-locale and theme
// switchers. They appear twice — in the page header, and inside the in-game
// menu's nav — so the group (including the NavItem mapping) is defined once
// and each host only decides how its flex row lays the group out. Each host
// passes its own full `className`: their justify/alignments genuinely differ,
// and merging a shared base here would let one host's utilities win over the
// other's
export function SiteNav({ className }: SiteNavProps) {
  return (
    <nav className={className}>
      {NAV_ITEMS.map((navItem) => (
        <NavItem key={navItem.href} {...navItem} />
      ))}
      <SiteLangChanger />
      <ThemeChanger />
    </nav>
  );
}

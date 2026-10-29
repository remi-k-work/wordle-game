// tanstack
import { Link, useRouterState } from "@tanstack/react-router";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { RegExp } from "effect";
import { useMessages } from "gt-react";

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

export function NavItem({ href, match, title, icon, isExternal = false }: NavItemProps) {
  const pathname = useRouterState({ select: ({ location }) => location.pathname });
  const messages = useMessages();

  const isActive = new RegExp.RegExp(match).test(pathname);

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

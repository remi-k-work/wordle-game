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

  // Compile regex client-side
  const regex = new RegExp(match);
  const isActive = regex.test(pathname);

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

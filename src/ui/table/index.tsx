// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { ComponentPropsWithoutRef } from "react";

export function Table({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div data-slot="table-container" className="@container overflow-x-auto overflow-y-clip">
      <table data-slot="table" className={cn("w-[100cqw] table-fixed caption-bottom border-collapse", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentPropsWithoutRef<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

export function TableBody({ className, ...props }: ComponentPropsWithoutRef<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentPropsWithoutRef<"tr">) {
  return <tr data-slot="table-row" className={cn("border-b", className)} {...props} />;
}

export function TableHead({ className, ...props }: ComponentPropsWithoutRef<"th">) {
  return <th data-slot="table-head" className={cn("p-2 align-bottom font-sans font-semibold text-text-2 sm:text-lg", className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return <td data-slot="table-cell" className={cn("p-2 text-center align-middle", className)} {...props} />;
}

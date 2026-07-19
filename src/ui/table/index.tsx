// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
import type { ComponentPropsWithoutRef } from "react";

function Table({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div data-slot="table-container" className="@container overflow-x-auto overflow-y-clip">
      <table data-slot="table" className={cn("w-[100cqw] table-fixed caption-bottom border-collapse", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: ComponentPropsWithoutRef<"thead">) {
  return <thead data-slot="table-header" className={className} {...props} />;
}

function TableBody({ className, ...props }: ComponentPropsWithoutRef<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: ComponentPropsWithoutRef<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("border-t font-semibold [&>tr]:last:border-b-0", className)} {...props} />;
}

function TableRow({ className, ...props }: ComponentPropsWithoutRef<"tr">) {
  return <tr data-slot="table-row" className={cn("border-b", className)} {...props} />;
}

function TableHead({ className, ...props }: ComponentPropsWithoutRef<"th">) {
  return <th data-slot="table-head" className={cn("p-2 align-bottom font-sans font-semibold text-text-2 sm:text-lg", className)} {...props} />;
}

function TableCell({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return <td data-slot="table-cell" className={cn("p-2 text-center align-middle", className)} {...props} />;
}

function TableCaption({ className, ...props }: ComponentPropsWithoutRef<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-text-2", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

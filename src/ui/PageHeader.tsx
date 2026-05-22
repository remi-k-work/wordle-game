// services, features, and other libraries
import { cn } from "@/lib/utils";

// types
interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <>
      <h1 className={cn("mt-4 bg-linear-to-r from-surface-1 via-surface-3 to-surface-1 p-3 font-sans text-xl leading-none", "sm:text-3xl lg:text-4xl")}>
        {title}
      </h1>
      <p className={cn("mb-8 bg-linear-to-r from-secondary to-surface-1 p-3 font-sans text-lg", "sm:text-2xl lg:text-3xl")}>{description}</p>
    </>
  );
}
